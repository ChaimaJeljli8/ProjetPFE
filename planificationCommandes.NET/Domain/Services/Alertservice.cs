using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Application.Interfaces.Repositories;
using planificationCommandesBackend.Application.Interfaces.Services;
using planificationCommandesBackend.Domain.Entities;

namespace planificationCommandesBackend.Domain.Services
{
    
    public class AlertService : IAlertService
    {
        private const int PPD = 1440; // minutes par jour (24h × 60)           
        private const double OVERLOAD_PCT = 85; // seuil de surcharge machine (%)
        private const double UNDERUSE_PCT = 40; // seuil de sous-utilisation machine (%)

        private readonly IAlertRepository _alertRepo;
        private readonly ICommandeRepository _commandeRepo;
        private readonly IMachineRepository _machineRepo;
        private readonly IPlanningRepository _planningRepo;

        public AlertService(
            IAlertRepository alertRepo,
            ICommandeRepository commandeRepo,
            IMachineRepository machineRepo,
            IPlanningRepository planningRepo)
        {
            _alertRepo = alertRepo;
            _commandeRepo = commandeRepo;
            _machineRepo = machineRepo;
            _planningRepo = planningRepo;
        }

        

        public async Task<AlertSummaryDto> RefreshAsync()
        {
            var now = DateTime.UtcNow;
            var commandes = (await _commandeRepo.GetAllAsync()).ToList();
            var machines = (await _machineRepo.GetAllAsync()).ToList();
            var lastPlan = await _planningRepo.GetLatestWithRowsAsync();

            var alerts = new List<Alert>();
            alerts.AddRange(BuildDelayAlerts(commandes, now));
            alerts.AddRange(BuildBottleneckAlerts(machines, lastPlan, now));

            await _alertRepo.ReplaceAlertsAsync(alerts);
            return ToSummary(alerts, now);
        }

        public async Task<AlertSummaryDto> GetCurrentAsync()
        {
            var active = await _alertRepo.GetAllActiveAsync();
            var generatedAt = await _alertRepo.GetLastGeneratedAtAsync() ?? DateTime.UtcNow;
            return ToSummary(active, generatedAt);
        }

        public Task DismissAsync(int id)
            => _alertRepo.DismissAsync(id);

        public Task DismissAllByTypeAsync(string type)
            => _alertRepo.DismissAllByTypeAsync(type);

        private static IEnumerable<Alert> BuildDelayAlerts(
            IEnumerable<Commande> commandes, DateTime now)
        {
            foreach (var c in commandes)
            {
                var status = (c.Statut ?? "").ToLowerInvariant();
                if (status is "livré" or "terminé" or "annulé" or "canceled") continue;

                var daysRemaining = (int)Math.Ceiling(
                    (c.DateExport.ToUniversalTime() - now).TotalDays);

                string severity;
                string message;

                if (daysRemaining < 0)
                {
                    severity = "critical";
                    message = $"La commande {c.NumeroCommande} est en retard de {-daysRemaining} jour(s).";
                }
                else if (daysRemaining == 0)
                {
                    severity = "critical";
                    message = $"La commande {c.NumeroCommande} doit être exportée aujourd'hui.";
                }
                else if (daysRemaining <= 5)
                {
                    severity = "warning";
                    message = $"La commande {c.NumeroCommande} expire dans {daysRemaining} jour(s).";
                }
                else if (daysRemaining <= 10)
                {
                    severity = "info";
                    message = $"La commande {c.NumeroCommande} expire dans {daysRemaining} jour(s).";
                }
                else
                {
                    continue; 
                }

                yield return new Alert
                {
                    Type = "Delay",
                    Severity = severity,
                    Message = message,
 
                    CommandeId = c.Id,
                    DaysRemaining = daysRemaining,
                    GeneratedAt = now,
                };
            }
        }


        private static IEnumerable<Alert> BuildBottleneckAlerts(
            IEnumerable<Machine> machines,
            Planning? lastPlan,
            DateTime now)
        {
            var rows = lastPlan?.Rows?.ToList() ?? new List<PlanningRow>();
            var loadMap = BuildLoadMap(rows);

            foreach (var m in machines)
            {
                double loadPct;
                int scheduledMinutes;
                int capaciteMinutes;

                if (rows.Count > 0)
                {
                    if (loadMap.TryGetValue(m.Id, out var entry))
                    {
                        scheduledMinutes = entry.ScheduledMinutes;
                        capaciteMinutes = entry.CapaciteMinutes;
                        loadPct = capaciteMinutes > 0
                            ? Math.Round((double)scheduledMinutes / capaciteMinutes * 100, 1)
                            : 0;
                    }
                    else
                    {
     
                        scheduledMinutes = 0;
                        capaciteMinutes = PPD;
                        loadPct = 0;
                    }
                }
                else
                {
                    
                    var st = (m.Statut ?? "").ToLowerInvariant();
                    // Cas sans planning : on suppose une charge normale de 60% pour les machines fonctionnelles
                    loadPct = st == "non fonctionnel" ? 0 : 60;
                    scheduledMinutes = 0;
                    capaciteMinutes = PPD;
                }

                string? bottleneckType;
                string severity;
                string message;

                if (loadPct > OVERLOAD_PCT)
                {
                    bottleneckType = "overloaded";
                    severity = "critical";
                    message = $"Machine {m.NomMachine} surchargée ({loadPct:F0} % > {OVERLOAD_PCT} %).";
                }
                else if (loadPct == 0)
                {
                    bottleneckType = "inactive";
                    severity = "warning";
                    message = $"Machine {m.NomMachine} inactive — aucune tâche planifiée.";
                }
                else if (loadPct < UNDERUSE_PCT)
                {
                    bottleneckType = "underused";
                    severity = "warning";
                    message = $"Machine {m.NomMachine} sous-utilisée ({loadPct:F0} % < {UNDERUSE_PCT} %).";
                }
                else
                {
                    continue; 
                }

                yield return new Alert
                {
                    Type = "Bottleneck",
                    Severity = severity,
                    Message = message,
                   
                    MachineId = m.Id,
                    LoadPct = loadPct,
                    ScheduledMinutes = scheduledMinutes,
                    CapaciteMinutes = capaciteMinutes,
                    BottleneckType = bottleneckType,
                    GeneratedAt = now,
                };
            }
        }



        private record LoadEntry(int ScheduledMinutes, int CapaciteMinutes);

        private static Dictionary<int, LoadEntry> BuildLoadMap(List<PlanningRow> rows)
        {
            var grouped = rows.GroupBy(r => r.MachineId);
            var map = new Dictionary<int, LoadEntry>();

            foreach (var g in grouped)
            {
                var scheduled = g.Sum(r => r.DureeMinutes);
                var span = g.Max(r => r.EndPM) - g.Min(r => r.StartPM);
                var capacity = Math.Max(span, PPD);  // capacité minimale = une journée complète
                map[g.Key] = new LoadEntry(scheduled, capacity);
            }

            return map;
        }


        private static AlertSummaryDto ToSummary(IEnumerable<Alert> alerts, DateTime generatedAt)
        {
            var list = alerts.ToList();

            var delays = list
                .Where(a => a.Type == "Delay")
                .OrderBy(a => a.DaysRemaining)
                .Select(ToDto)
                .ToList();

            var bottlenecks = list
                .Where(a => a.Type == "Bottleneck")
                .OrderBy(a => a.Severity == "critical" ? 0 : 1)
                .ThenBy(a => a.BottleneckType)
                .ThenByDescending(a => a.LoadPct)
                .Select(ToDto)
                .ToList();

            return new AlertSummaryDto
            {
                DelayAlerts = delays,
                BottleneckAlerts = bottlenecks,
                GeneratedAt = generatedAt,
                TotalActive = delays.Count + bottlenecks.Count,
            };
        }

        private static AlertDto ToDto(Alert a) => new()
        {
            Id = a.Id,
            Type = a.Type,
            Severity = a.Severity,
            Message = a.Message,
            GeneratedAt = a.GeneratedAt,
            IsDismissed = a.IsDismissed,

            CommandeId = a.CommandeId,
            NumeroCommande = a.Commande?.NumeroCommande,
            DateExport = a.Commande?.DateExport,
            DaysRemaining = a.DaysRemaining,
            Urgence = a.Commande != null ? a.Commande.Urgence == 1 : null,

            MachineId = a.MachineId,
            MachineName = a.Machine?.NomMachine,
            LoadPct = a.LoadPct,
            ScheduledMinutes = a.ScheduledMinutes,
            CapaciteMinutes = a.CapaciteMinutes,
            BottleneckType = a.BottleneckType,
        };
    }
}