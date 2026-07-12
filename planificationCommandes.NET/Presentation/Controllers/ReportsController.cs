using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Application.Interfaces.Services;

namespace planificationCommandesBackend.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,PlanificationResponsable")]
    public class ReportsController : ControllerBase     // Hérite de ControllerBase pour bénéficier des fonctionnalités API ASP.NET Core comme :ok(), BadRequest(), NotFound(), etc.
    {
        private readonly IReportService _complianceService;

        public ReportsController(IReportService complianceService)
            => _complianceService = complianceService;

        // Génère un rapport de conformité des deadlines sur une période optionnelle.
        // Les paramètres "from" et "to" sont facultatifs mais doivent être des dates valides si fournis.
        [HttpGet("deadline-compliance")]
        public async Task<ActionResult<DeadlineComplianceSummaryDto>> GetDeadlineCompliance(
            [FromQuery] string? from,
            [FromQuery] string? to)
        {
            DateTime? fromDt = null;
            DateTime? toDt = null;

            if (!string.IsNullOrWhiteSpace(from))
            {
                if (!DateTime.TryParse(from, out var parsedFrom))
                    return BadRequest(new { message = $"Date 'from' invalide : {from}" });
                fromDt = parsedFrom.Date;
            }

            if (!string.IsNullOrWhiteSpace(to))
            {
                if (!DateTime.TryParse(to, out var parsedTo))
                    return BadRequest(new { message = $"Date 'to' invalide : {to}" });
                toDt = parsedTo.Date.AddDays(1).AddTicks(-1);
            }
            // Vérification logique de cohérence des dates
            if (fromDt.HasValue && toDt.HasValue && fromDt > toDt)
                return BadRequest(new { message = "La date 'from' doit être antérieure à 'to'." });
            // Vérification logique de cohérence des dates
            var report = await _complianceService.GetReportAsync(fromDt, toDt);
            // Retour du rapport agrégé
            return Ok(report);
        }
    }
}