using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Application.Interfaces.Repositories;
using planificationCommandesBackend.Application.Interfaces.Services;
using System.Globalization;

namespace planificationCommandesBackend.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,PlanificationResponsable")]
    public class CommandesController : ControllerBase     // Hérite de ControllerBase pour bénéficier des fonctionnalités API ASP.NET Core comme :ok(), BadRequest(), NotFound(), etc.
    {
        private readonly ICommandeService _commandeService;

        // Injection du service de gestion des commandes
        public CommandesController(ICommandeService commandeService)
        {
            _commandeService = commandeService;
        }

        // Récupère la liste de toutes les commandes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CommandeDto>>> GetCommandes()
        {
            var commandes = await _commandeService.GetAllAsync();
            return Ok(commandes);
        }

        // Récupère une commande par son identifiant
        [HttpGet("{id}")]
        public async Task<ActionResult<CommandeDto>> GetCommande(int id)
        {
            var commande = await _commandeService.GetByIdAsync(id);
            if (commande == null)
                return NotFound(new { message = "Commande non trouvée" });

            return Ok(commande);
        }

        // Recherche des commandes selon différents critères
        [HttpGet("Search")]
        public async Task<ActionResult<IEnumerable<CommandeDto>>> Search(
            [FromQuery] string? keyword,
            [FromQuery] int? urgence,
            [FromQuery] string? statut,
            [FromQuery] int? recetteId,
            [FromQuery] DateTime? dateExportFrom,
            [FromQuery] DateTime? dateExportTo)
        {
            var filter = new CommandeSearchFilter
            {
                Keyword = keyword,
                Urgence = urgence,
                Statut = statut,
                RecetteId = recetteId,
                DateExportFrom = dateExportFrom,
                DateExportTo = dateExportTo
            };

            var results = await _commandeService.SearchAsync(filter);
            return Ok(results);
        }

        // Retourne les statistiques des commandes
        [HttpGet("Statistics")]
        public async Task<ActionResult<object>> GetStatistics()
        {
            var stats = await _commandeService.GetStatisticsAsync();
            return Ok(stats);
        }

        // POST: api/Commandes Crée une nouvelle commande
        [HttpPost]
        public async Task<ActionResult<CommandeDto>> CreateCommande([FromBody] CreateCommandeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _commandeService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetCommande), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // PUT: api/Commandes/id Met à jour une commande existante
        [HttpPut("{id}")]
        public async Task<ActionResult<CommandeDto>> UpdateCommande(int id, [FromBody] UpdateCommandeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _commandeService.UpdateAsync(id, dto);
                return Ok(new { message = "Commande mise à jour avec succès", commande = updated });
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // DELETE: api/Commandes/id Supprime une commande
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCommande(int id)
        {
            try
            {
                await _commandeService.DeleteAsync(id);
                return Ok(new { message = "Commande supprimée avec succès" });
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        // POST: api/Commandes/Import/Json  Importation de commandes depuis JSON
        [HttpPost("Import/Json")]
        public async Task<ActionResult<ImportResultDto>> ImportJson([FromBody] List<ImportCommandeDto> rows)
        {
            if (rows == null || !rows.Any())
                return BadRequest(new { message = "Aucune donnée à importer." });

            var result = await BuildImportResult(rows, csvParseErrors: new List<ImportRowErrorDto>());
            return Ok(result);
        }

        // POST: api/Commandes/Import/Csv Importation de commandes depuis un fichier CSV
        // Expected CSV columns: NumeroCommande, DateExport, Urgence, Quantite, NomRecette
        [HttpPost("Import/Csv")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ImportResultDto>> ImportCsv(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Fichier CSV manquant ou vide." });
            // Vérifie que le fichier est un CSV valide
            if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Seuls les fichiers .csv sont acceptés ici." });

            var validRows = new List<ImportCommandeDto>();
            var csvParseErrors = new List<ImportRowErrorDto>();
            int rowIndex = 1; // La première ligne correspond à l'en-tête du fichier

            try
            {
                using var reader = new StreamReader(file.OpenReadStream());
                var content = await reader.ReadToEndAsync();

                if (string.IsNullOrWhiteSpace(content))
                    return BadRequest(new { message = "Le fichier CSV est vide." });
                // Configuration de CsvHelper pour ignorer les champs manquants
                var config = new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    HeaderValidated = null,
                    MissingFieldFound = null,
                    TrimOptions = TrimOptions.Trim
                };

                using var csv = new CsvReader(new StringReader(content), config);

                bool hasHeader;
                try
                {
                    hasHeader = await csv.ReadAsync();
                    if (hasHeader) csv.ReadHeader();
                }
                catch (Exception ex)
                {
                    return BadRequest(new { message = $"Impossible de lire l'en-tête CSV : {ex.Message}" });
                }

                if (!hasHeader || csv.HeaderRecord == null || csv.HeaderRecord.Length == 0)
                    return BadRequest(new { message = "Le fichier CSV ne contient pas d'en-tête valide." });
                // Lecture et validation des données ligne par ligne
                while (await csv.ReadAsync())
                {
                    rowIndex++;
                    try
                    {
                        var numero = csv.GetField<string>("NumeroCommande")?.Trim();
                        var dateExportStr = csv.GetField<string>("DateExport")?.Trim();
                        var urgenceStr = csv.GetField<string>("Urgence")?.Trim();
                        var quantiteStr = csv.GetField<string>("Quantite")?.Trim();
                        var nomRecette = csv.GetField<string>("NomRecette")?.Trim();
                        // Validation des champs obligatoires et des formats
                        var rowErrors = new List<string>();

                        if (string.IsNullOrWhiteSpace(numero))
                            rowErrors.Add("NumeroCommande est vide.");

                        if (!DateTime.TryParseExact(dateExportStr,
                            new[] { "dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "dd-MM-yyyy" },
                            CultureInfo.InvariantCulture, DateTimeStyles.None, out var dateExport))
                            rowErrors.Add("DateExport invalide.");

                        if (!int.TryParse(urgenceStr, out var urgence) || urgence < 1)
                            rowErrors.Add("Urgence invalide (entier ≥ 1 requis).");

                        if (!int.TryParse(quantiteStr, out var quantite) || quantite <= 0)
                            rowErrors.Add("Quantite invalide (entier > 0 requis).");

                        if (string.IsNullOrWhiteSpace(nomRecette))
                            rowErrors.Add("NomRecette est vide.");

                        if (rowErrors.Any())
                        {
                            // Ajoute la ligne à la liste des erreurs si elle est invalide
                            csvParseErrors.Add(new ImportRowErrorDto
                            {
                                Row = rowIndex,
                                NumeroCommande = numero ?? "",
                                Reason = string.Join(" | ", rowErrors)
                            });
                            continue;
                        }
                        // Ajoute la ligne valide à la liste des commandes à importer
                        validRows.Add(new ImportCommandeDto
                        {
                            NumeroCommande = numero!,
                            DateExport = dateExport,
                            Urgence = urgence,
                            Quantite = quantite,
                            NomRecette = nomRecette!   
                        });
                    }
                    catch
                    {
                        csvParseErrors.Add(new ImportRowErrorDto
                        {
                            Row = rowIndex,
                            NumeroCommande = "",
                            Reason = "Erreur de lecture de la ligne."
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Erreur de lecture CSV : {ex.Message}" });
            }

            int totalDataRows = rowIndex - 1;
            var result = await BuildImportResult(validRows, csvParseErrors);
            result.TotalRows = totalDataRows;
            return Ok(result);
        }

        private async Task<ImportResultDto> BuildImportResult(
            List<ImportCommandeDto> validRows,
            List<ImportRowErrorDto> csvParseErrors)
        {
            // Initialise le résultat global de l'import
            var result = new ImportResultDto
            {
                TotalRows = validRows.Count + csvParseErrors.Count,
                Imported = 0,
                Skipped = csvParseErrors.Count,
                Errors = new List<ImportRowErrorDto>(csvParseErrors)
            };

            if (validRows.Any())
            {
                // Lance l'import des lignes valides
                var serviceResult = await _commandeService.ImportAsync(validRows);

                result.Imported += serviceResult.Imported.Count;
                // Ajoute les lignes ignorées et leurs motifs d'erreur
                foreach (var skip in serviceResult.Skipped)
                {
                    result.Skipped++;
                    result.Errors.Add(new ImportRowErrorDto
                    {
                        Row = skip.Row,
                        NumeroCommande = skip.NumeroCommande,
                        Reason = skip.Reason
                    });
                }
            }

            return result;
        }
    }
}