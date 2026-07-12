using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Domain.Entities;
using planificationCommandesBackend.Infrastructure.Persistence;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

using System.Text;
using System.Text.Json;
using QuestDocument = QuestPDF.Fluent.Document;
using QuestColor = QuestPDF.Infrastructure.Color;
using planificationCommandesBackend.Application.Interfaces.Services;

namespace planificationCommandesBackend.Domain.Services
{

    public class PlanningService : IPlanningService
    {
        private readonly AppDbContext _db;
        private readonly IHttpClientFactory _httpFactory; // client HTTP pour appeler FastAPI
        private readonly IConfiguration _config; // pour lire l'URL de FastAPI depuis appsettings
        private readonly IAlertService _alertService;
        public PlanningService(
                AppDbContext db,
                IHttpClientFactory httpFactory,
                IConfiguration config,
                IAlertService alertService)
        {
            _db = db;
            _httpFactory = httpFactory;
            _config = config;
            _alertService = alertService;
        }

        public async Task<PlanningDetailDto> RunAndSaveAsync(string bearerToken, TriggerPlanningDto req)
        {
            var fastApiUrl = _config["FastApi:BaseUrl"] ?? "http://localhost:8000";
            var client = _httpFactory.CreateClient("fastapi");
            // Limite le nombre de machines par opération entre 1 et 3
            var maxMachines = Math.Clamp(req.MaxMachinesPerOp, 1, 3);
            // Construit le payload envoyé à FastAPI
            // Le token JWT est transmis pour que FastAPI puisse à son tour appeler l'API .NET
            var payloadObj = new Dictionary<string, object?>
            {
                ["token"] = bearerToken,
                ["commandeIds"] = req.CommandeIds ?? new List<int>(),
                ["maxMachinesPerOp"] = maxMachines,
            };
            // La date de début est optionnelle — si absente, FastAPI démarre à partir de maintenant
            if (!string.IsNullOrWhiteSpace(req.StartDatetime))
                payloadObj["startDatetime"] = req.StartDatetime;

            var payload = JsonSerializer.Serialize(payloadObj, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            Console.WriteLine($"[PlanningService] Sending to FastAPI: {payload[..Math.Min(200, payload.Length)]}");
            // Envoie le planning request à FastAPI
            using var content = new StringContent(payload, Encoding.UTF8, "application/json");
            // Le planning est généré par un service FastAPI Python séparé — on lui envoie les données et on persiste le résultat
            using var response = await client.PostAsync($"{fastApiUrl}/api/planning/run", content);

            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"[PlanningService] FastAPI error {response.StatusCode}: {responseBody[..Math.Min(500, responseBody.Length)]}");
                // Tente d'extraire une erreur métier structurée (code + message) retournée par FastAPI
                try
                {
                    using var doc = System.Text.Json.JsonDocument.Parse(responseBody);
                    var detail = doc.RootElement.TryGetProperty("detail", out var detailEl)
                        ? detailEl
                        : doc.RootElement;

                    var code = detail.TryGetProperty("code", out var cEl) ? cEl.GetString() : null;
                    var message = detail.TryGetProperty("message", out var mEl) ? mEl.GetString() : null;
                    // Remonte l'exception métier au controller pour retourner un 400 avec code + message
                    if (!string.IsNullOrWhiteSpace(code))
                        throw new PlanningBusinessException(code, message ?? code);
                }
                catch (PlanningBusinessException) { throw; }
                catch { } // si la réponse n'est pas du JSON structuré, on tombe dans l'exception générique

                throw new InvalidOperationException(
                    $"FastAPI error {response.StatusCode}: {responseBody[..Math.Min(300, responseBody.Length)]}");
            }
            // 1. FastAPI génère le planning et retourne le résultat en JSON
            var dto = JsonSerializer.Deserialize<PlanningRunResponseDto>(responseBody,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                ?? throw new InvalidOperationException("Null response from FastAPI");
            // 2. construit l'entité Planning à partir du résultat FastAPI
            var planning = new Planning
            {
                DateGeneration = DateTime.UtcNow,
                DateDebut = dto.StartDate,
                Statut = dto.Status,
                MakespanPM = dto.MakespanPM,
                MakespanDays = dto.MakespanDays,
                NombreCommandes = dto.Rows.Select(r => r.NumeroCommande).Distinct().Count(),
                NombreLignes = dto.Rows.Count,
                Rows = dto.Rows.Select(r => new PlanningRow
                {
                    NumeroCommande = r.NumeroCommande,
                    Quantite = r.Quantite,
                    RecetteId = r.RecetteId,
                    Urgence = r.Urgence,
                    NomOperation = r.NomOperation,
                    MachineId = r.MachineId,
                    MachineName = r.MachineName,
                    StartPM = r.StartPM,
                    EndPM = r.EndPM,
                    DureeMinutes = r.DureeMinutes,
                    TempsChargementMinutes = r.TempsChargementMinutes,
                    TempsDecharementMinutes = r.TempsDecharementMinutes,
                    DureeTotale = r.DureeTotale,
                    LotSize = r.LotSize,
                    QuantiteLot = r.QuantiteLot,
                    LotIdx = r.LotIdx,
                    NbLots = r.NbLots,
                    DateStart = r.DateStart,
                    DateEnd = r.DateEnd,
                    DateExport = r.DateExport,
                }).ToList()
            };
            // 3. sauvegarde en base via AppDbContext directement (pas via un repository)
            _db.Plannings.Add(planning);
            await _db.SaveChangesAsync();
            // 4. Rafraîchit les alertes après sauvegarde
            await _alertService.RefreshAsync();

            return MapToDetail(planning, dto.Warnings);
        }

        // Retourne la liste résumée de tous les plannings, du plus récent au plus ancien
        public async Task<List<PlanningSummaryDto>> GetAllSummariesAsync()
            => await _db.Plannings
                .OrderByDescending(p => p.DateGeneration)
                .Select(p => new PlanningSummaryDto
                {
                    Id = p.Id,
                    DateGeneration = p.DateGeneration,
                    DateDebut = p.DateDebut,
                    Statut = p.Statut,
                    MakespanDays = p.MakespanDays,
                    NombreCommandes = p.NombreCommandes,
                    NombreLignes = p.NombreLignes,
                })
                .ToListAsync();

        // Retourne le détail complet d'un planning avec toutes ses lignes
        public async Task<PlanningDetailDto?> GetByIdAsync(int id)
        {
            var planning = await _db.Plannings
                .Include(p => p.Rows)
                .FirstOrDefaultAsync(p => p.Id == id);
            return planning == null ? null : MapToDetail(planning, new());
        }

        //  Excel export (ClosedXML) 

        public async Task<byte[]> ExportExcelAsync(int id)
        {
            // Charge le planning avec ses lignes depuis la base
            var planning = await _db.Plannings
                .Include(p => p.Rows)
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new KeyNotFoundException($"Planning {id} not found");

            using var wb = new XLWorkbook();
            // La date de base sert à convertir les StartPM/EndPM (en minutes) en dates/heures réelles
            var baseDate = DateTime.TryParse(planning.DateDebut, out var bd)
                ? bd.Date
                : DateTime.UtcNow.Date;

            var ws = wb.Worksheets.Add("Planning Détaillé");

            var headers = new[]
            {
                "Machine", "N° Commande", "Opération",
                "Début", "Fin",
                "Charg. (min)", "Cycle (min)", "Décharg. (min)", "Durée totale (min)",
                "Lot N°", "Pièces / lot", "Qté totale", "Urgence", "Date export", "Statut export"
            };

            ws.Cell("A1").InsertData(new[] { headers });
            ws.Row(1).Style.Font.Bold = true;
            ws.Row(1).Style.Fill.BackgroundColor = XLColor.FromHtml("#013F82");
            ws.Row(1).Style.Font.FontColor = XLColor.White;

            var orderedRows = planning.Rows
                .OrderBy(r => r.StartPM)
                .ThenBy(r => r.MachineName)
                .ToList();

            ws.Cell("A2").InsertData(orderedRows.Select(r =>
            {
                var finishTime = baseDate.AddMinutes(r.EndPM);
                // Détecte les lignes hors délai : la fin réelle dépasse la date d'export de la commande
                bool isLate = DateTime.TryParse(r.DateExport, out var exp)
                    && finishTime > exp.Date.AddDays(1).AddSeconds(-1);
                return new object[]
                {
                    r.MachineName,
                    r.NumeroCommande,
                    r.NomOperation,
                    PmToDateTime(baseDate, r.StartPM),
                    PmToDateTime(baseDate, r.EndPM),
                    r.TempsChargementMinutes,
                    r.DureeMinutes,
                    r.TempsDecharementMinutes,
                    r.DureeTotale,
                    $"{r.LotIdx + 1}/{r.NbLots}",
                    r.LotSize,
                    r.Quantite,
                    r.Urgence,
                    r.DateExport,
                    isLate ? "Hors délai" : "Dans les délais",
                };
            }));

            ws.Columns().AdjustToContents();

            int dataRow = 2;
            foreach (var r in orderedRows)
            {
                var finishTime2 = baseDate.AddMinutes(r.EndPM);
                if (DateTime.TryParse(r.DateExport, out var expDate)
                    && finishTime2 > expDate.Date.AddDays(1).AddSeconds(-1))
                {
                    var xlRow = ws.Row(dataRow);
                    xlRow.Style.Font.FontColor = XLColor.FromHtml("#92400E");
                    xlRow.Style.Fill.BackgroundColor = XLColor.FromHtml("#FFFBEB");

                    var statusCell = ws.Cell(dataRow, 15);
                    statusCell.Style.Font.Bold = true;
                    statusCell.Style.Font.FontColor = XLColor.FromHtml("#B45309");
                }
                dataRow++;
            }

            using var ms = new MemoryStream();
            wb.SaveAs(ms);
            return ms.ToArray();
        }

        //  PDF export (QuestPDF) 

        public async Task<byte[]> ExportPdfAsync(int id)
        {
            var planning = await _db.Plannings
                .Include(p => p.Rows)
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new KeyNotFoundException($"Planning {id} not found");

            var pdfBaseDate = DateTime.TryParse(planning.DateDebut, out var pbd)
                ? pbd.Date
                : DateTime.UtcNow.Date;

            var rows = planning.Rows
                .OrderBy(r => r.StartPM)
                .ThenBy(r => r.MachineName)
                .ToList();

            var pdfBytes = QuestDocument.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(1.5f, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(8).FontFamily("Arial"));

                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem()
                               .Text("DENIM PLANNER — Planning de Production")
                               .Bold().FontSize(16).FontColor(QuestColor.FromHex("#013F82"));

                            row.ConstantItem(200).AlignRight()
                               .Text($"Généré le {planning.DateGeneration:dd/MM/yyyy HH:mm}")
                               .FontSize(8).FontColor(Colors.Grey.Darken2);
                        });

                        col.Item().PaddingTop(4).Row(row =>
                        {
                            row.RelativeItem().Text(
                                $"Planning N°{planning.Id}  ·  Statut: {planning.Statut}" +
                                $"  ·  Makespan: {FormatMakespan(planning.MakespanPM)}" +
                                $"  ·  {planning.NombreCommandes} commandes" +
                                $"  ·  {planning.NombreLignes} lignes")
                                .FontSize(8).FontColor(Colors.Grey.Darken2);
                        });

                        col.Item().PaddingTop(6)
                           .LineHorizontal(1)
                           .LineColor(QuestColor.FromHex("#013F82"));
                    });

                    page.Content().PaddingTop(8).Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            cols.RelativeColumn(2.2f); // Machine
                            cols.RelativeColumn(2.0f); // N° Commande
                            cols.RelativeColumn(2.0f); // Opération
                            cols.RelativeColumn(1.5f); // Début
                            cols.RelativeColumn(1.5f); // Fin
                            cols.RelativeColumn(1.0f); // Charg.
                            cols.RelativeColumn(1.0f); // Cycle
                            cols.RelativeColumn(1.0f); // Déch.
                            cols.RelativeColumn(1.2f); // Lot
                            cols.RelativeColumn(1.0f); // Pièces
                            cols.RelativeColumn(0.8f); // Urg.
                            cols.RelativeColumn(1.8f); // date export
                        });

                        table.Header(header =>
                        {
                            static IContainer HeaderCell(IContainer c) =>
                                c.Background(QuestColor.FromHex("#013F82"))
                                 .Padding(4).AlignCenter().AlignMiddle();

                            foreach (var h in new[]
                            {
                                "Machine", "N° Commande", "Opération",
                                "Début", "Fin", "Charg.(m)", "Cycle(m)",
                                "Déch.(m)", "Lot", "Pièces", "Urg.", "date export"
                            })
                            {
                                header.Cell().Element(HeaderCell)
                                      .Text(h).Bold().FontColor(Colors.White).FontSize(7);
                            }
                        });

                        bool even = false;
                        foreach (var r in rows)
                        {
                            even = !even;
                            var finishTime = pdfBaseDate.AddMinutes(r.EndPM);
                            bool isLate = DateTime.TryParse(r.DateExport, out var expDt)
                                && finishTime > expDt.Date.AddDays(1).AddSeconds(-1);

                            var rowBg = isLate
                                ? QuestColor.FromHex("#FFFBEB")
                                : (even ? QuestColor.FromHex("#f8fafc") : Colors.White);

                            IContainer DataCell(IContainer c) =>
                                c.Background(rowBg)
                                 .BorderBottom(0.3f).BorderColor(QuestColor.FromHex("#e2e8f0"))
                                 .Padding(3).AlignMiddle();

                            var textColor = isLate
                                ? QuestColor.FromHex("#92400E")
                                : QuestColor.FromHex("#1e293b");

                            string urgColor = r.Urgence switch
                            {
                                1 => "#DC2626",
                                2 => "#F97316",
                                3 => "#EAB308",
                                4 => "#22C55E",
                                _ => "#10B981"
                            };

                            table.Cell().Element(DataCell).Text(r.MachineName).FontSize(7).FontColor(textColor);
                            table.Cell().Element(DataCell).Text(r.NumeroCommande).Bold().FontSize(7).FontColor(textColor);
                            table.Cell().Element(DataCell).Text(r.NomOperation).FontSize(7).FontColor(textColor);
                            table.Cell().Element(DataCell).Text(PmToDateTime(pdfBaseDate, r.StartPM)).FontSize(7);
                            table.Cell().Element(DataCell).Text(PmToDateTime(pdfBaseDate, r.EndPM)).FontSize(7);
                            table.Cell().Element(DataCell).AlignCenter().Text(r.TempsChargementMinutes.ToString()).FontSize(7);
                            table.Cell().Element(DataCell).AlignCenter().Text(r.DureeMinutes.ToString()).FontSize(7);
                            table.Cell().Element(DataCell).AlignCenter().Text(r.TempsDecharementMinutes.ToString()).FontSize(7);
                            table.Cell().Element(DataCell).AlignCenter().Text($"{r.LotIdx + 1}/{r.NbLots}").FontSize(7);
                            table.Cell().Element(DataCell).AlignCenter().Text(r.LotSize.ToString()).FontSize(7);
                            table.Cell().Element(DataCell).AlignCenter()
                                 .Text(r.Urgence.ToString()).Bold()
                                 .FontColor(QuestColor.FromHex(urgColor)).FontSize(7);

                            table.Cell().Element(DataCell).Column(col =>
                            {
                                col.Item().Text(r.DateExport ?? "—").FontSize(7).FontColor(textColor);
                                if (isLate)
                                {
                                    col.Item().PaddingTop(2)
                                       .Background(QuestColor.FromHex("#FDE68A"))
                                       .Padding(1).AlignCenter()
                                       .Text("Hors délai").Bold()
                                       .FontSize(6).FontColor(QuestColor.FromHex("#92400E"));
                                }
                            });
                        }
                    });

                    page.Footer().AlignCenter().Text(t =>
                    {
                        t.Span("Denim Planner · WIC MIC GROUP · Page ").FontSize(7).FontColor(Colors.Grey.Darken2);
                        t.CurrentPageNumber().FontSize(7);
                        t.Span(" / ").FontSize(7);
                        t.TotalPages().FontSize(7);
                    });
                });
            }).GeneratePdf();

            return pdfBytes;
        }


        private static string PmToDateTime(DateTime baseDate, int pm)
        {
            var dt = baseDate.AddMinutes(pm);
            return $"{dt:yyyy-MM-dd} {dt:HH}h{dt:mm}";
        }

        private static string FormatMakespan(int totalMinutes)
        {
            var days = totalMinutes / (24 * 60);
            var hours = (totalMinutes % (24 * 60)) / 60;
            var mins = totalMinutes % 60;

            return (days, hours, mins) switch
            {
                ( > 0, > 0, > 0) => $"{days}j {hours}h {mins}min",
                ( > 0, > 0, 0) => $"{days}j {hours}h",
                ( > 0, 0, > 0) => $"{days}j {mins}min",
                ( > 0, 0, 0) => $"{days}j",
                (0, > 0, > 0) => $"{hours}h {mins}min",
                (0, > 0, 0) => $"{hours}h",
                _ => $"{mins}min",
            };
        }

        private static PlanningDetailDto MapToDetail(Planning p, List<string> warnings)
            => new()
            {
                Id = p.Id,
                DateGeneration = p.DateGeneration,
                DateDebut = p.DateDebut,
                Statut = p.Statut,
                MakespanDays = p.MakespanDays,
                NombreCommandes = p.NombreCommandes,
                NombreLignes = p.NombreLignes,
                Warnings = warnings,
                Rows = p.Rows.Select(r => new GanttRowDto
                {
                    NumeroCommande = r.NumeroCommande,
                    Quantite = r.Quantite,
                    RecetteId = r.RecetteId,
                    Urgence = r.Urgence,
                    NomOperation = r.NomOperation,
                    MachineId = r.MachineId,
                    MachineName = r.MachineName,
                    StartPM = r.StartPM,
                    EndPM = r.EndPM,
                    DureeMinutes = r.DureeMinutes,
                    TempsChargementMinutes = r.TempsChargementMinutes,
                    TempsDecharementMinutes = r.TempsDecharementMinutes,
                    DureeTotale = r.DureeTotale,
                    LotSize = r.LotSize,
                    QuantiteLot = r.QuantiteLot,
                    LotIdx = r.LotIdx,
                    NbLots = r.NbLots,
                    DateStart = r.DateStart,
                    DateEnd = r.DateEnd,
                    DateExport = r.DateExport,
                }).ToList()
            };
    }



    public class PlanningBusinessException : Exception
    {
        public string Code { get; }

        public PlanningBusinessException(string code, string message)
            : base(message)
            => Code = code;
    }
}