using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Application.Interfaces.Services;
using planificationCommandesBackend.Domain.Services;

namespace planificationCommandesBackend.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class PlanningController : ControllerBase     // Hérite de ControllerBase pour bénéficier des fonctionnalités API ASP.NET Core comme :ok(), BadRequest(), NotFound(), etc.
    {
        private readonly IPlanningService _planningService;

        public PlanningController(IPlanningService planningService)
            => _planningService = planningService;

        // Lance le moteur de planification et persiste le résultat en base.
        [HttpPost("run")]
        [Authorize(Roles = "PlanificationResponsable")]
        public async Task<ActionResult<PlanningDetailDto>> Run([FromBody] TriggerPlanningDto dto)
        {
            // Vérification explicite du header Authorization (sécurité supplémentaire)
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer "))
                return Unauthorized("Missing Bearer token.");
            // Extraction du token JWT brut (sans le préfixe "Bearer ")
            var token = authHeader["Bearer ".Length..].Trim();

            try
            {
                // Exécution du processus de planification + sauvegarde en base
                var result = await _planningService.RunAndSaveAsync(token, dto);
                return Ok(result);
            }
            catch (PlanningBusinessException ex)
            {
                
                return BadRequest(new { code = ex.Code, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        // Récupère la liste des plannings 
        [HttpGet]
        [Authorize(Roles = "Admin,PlanificationResponsable,Worker")]
        public async Task<ActionResult<List<PlanningSummaryDto>>> GetAll()
            => Ok(await _planningService.GetAllSummariesAsync());

        // Récupère le détail complet d’un planning via son ID.
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,PlanificationResponsable,Worker")]
        public async Task<ActionResult<PlanningDetailDto>> GetById(int id)
        {
            var result = await _planningService.GetByIdAsync(id);
            if (result == null)
                return NotFound(new { message = $"Planning {id} non trouvé." });
            return Ok(result);
        }

        // Export a saved planning as Excel 
        // GET /api/Planning/{id}/export/excel

        [HttpGet("{id:int}/export/excel")]
        [Authorize(Roles = "Admin,PlanificationResponsable,Worker")]
        public async Task<IActionResult> ExportExcel(int id)
        {
            try
            {
                // Génération du fichier Excel sous forme de tableau de bytes
                var bytes = await _planningService.ExportExcelAsync(id);
                // Retour du fichier avec MIME type Excel OpenXML
                return File(bytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"planning_{id}_{DateTime.UtcNow:yyyyMMdd_HHmm}.xlsx");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }


        // Export a saved planning as PDF.
        // GET /api/Planning/{id}/export/pdf
        [HttpGet("{id:int}/export/pdf")]
        [Authorize(Roles = "Admin,PlanificationResponsable,Worker")]
        public async Task<IActionResult> ExportPdf(int id)
        {
            try
            {
                // Génération du PDF sous forme de bytes
                var bytes = await _planningService.ExportPdfAsync(id);
                // Retour du fichier PDF téléchargeable
                return File(bytes, "application/pdf",
                    $"planning_{id}_{DateTime.UtcNow:yyyyMMdd_HHmm}.pdf");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}