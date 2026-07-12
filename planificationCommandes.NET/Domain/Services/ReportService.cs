// Domain/Services/DeadlineComplianceService.cs
using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Application.Interfaces.Repositories;
using planificationCommandesBackend.Application.Interfaces.Services;

namespace planificationCommandesBackend.Domain.Services
{
    
    public class ReportService : IReportService
    {
        private readonly ICommandeRepository _commandeRepo;

        public ReportService(ICommandeRepository commandeRepo)
            => _commandeRepo = commandeRepo;

        public async Task<DeadlineComplianceSummaryDto> GetReportAsync(
            DateTime? from, DateTime? to)
        {
            var all = await _commandeRepo.GetAllAsync();

            if (from.HasValue) all = all.Where(c => c.DateExport >= from.Value).ToList();
            if (to.HasValue) all = all.Where(c => c.DateExport <= to.Value).ToList();

            var rows = new List<DeadlineComplianceRowDto>();

  
            var today = DateTime.Today;

            foreach (var c in all)
            {
                var statutLc = (c.Statut ?? "").Trim().ToLowerInvariant();

                if (statutLc is "annulé" or "annule" or "canceled" or "cancelled")
                    continue;

                double? daysVariance;
                string status;

                if (statutLc is "livré" or "livre" or "terminé" or "termine")
                {
                    // Les commandes livrées/terminées sont considérées à l'heure (variance = 0)
                    daysVariance = 0;
                    status = "OnTime";
                }
                else
                {
                    if (c.DateExport.Date < today)
                    {
                        daysVariance = Math.Round((today - c.DateExport.Date).TotalDays, 1);
                        status = "Late";    
                    }
                    else
                    {
                        daysVariance = null;
                        status = "Pending";  
                    }
                }

                rows.Add(new DeadlineComplianceRowDto
                {
                    Id = c.Id,
                    NumeroCommande = c.NumeroCommande,
                    DateExport = c.DateExport,
                    DateLivraison = null,   
                    Statut = c.Statut ?? "",
                    NomRecette = c.Recette?.NomRecette ?? "",
                    Urgence = c.Urgence,
                    Quantite = c.Quantite,
                    DaysVariance = daysVariance,
                    Status = status,
                });
            }

            var onTime = rows.Count(r => r.Status == "OnTime");
            var late = rows.Count(r => r.Status == "Late");
            var pending = rows.Count(r => r.Status == "Pending");
            // Taux calculé uniquement sur les commandes décidées (OnTime + Late), pas les Pending
            var decided = onTime + late;
            var rate = decided > 0
                ? Math.Round((double)onTime / decided * 100, 1)
                : 0.0;

            var varianceRows = rows.Where(r => r.DaysVariance.HasValue).ToList();
            var avgVariance = varianceRows.Count > 0
                ? Math.Round(varianceRows.Average(r => r.DaysVariance!.Value), 1)
                : 0.0;

            rows = rows
                .OrderBy(r => r.Status == "OnTime" ? 2 : r.Status == "Late" ? 0 : 1)
                .ThenBy(r => r.DateExport)
                .ToList();

            return new DeadlineComplianceSummaryDto
            {
                TotalCommandes = rows.Count,
                OnTime = onTime,
                Late = late,
                Pending = pending,
                ComplianceRate = rate,
                AverageDaysVariance = avgVariance,
                Rows = rows,
            };
        }
    }
}