using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Application.Interfaces.Services;

namespace planificationCommandesBackend.Presentation.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    // Accès réservé aux responsables de planification authentifiés via JWT
    [Authorize(
        AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme,
        Roles = "PlanificationResponsable")]
    // Injection du service de gestion des alertes
    public class AlertsController : ControllerBase     // Hérite de ControllerBase pour bénéficier des fonctionnalités API ASP.NET Core comme :ok(), BadRequest(), NotFound(), etc.
    {
        private readonly IAlertService _alertService;

        public AlertsController(IAlertService alertService)
            => _alertService = alertService;

        // Récupère les alertes actives
        [HttpGet]
        public async Task<ActionResult<AlertSummaryDto>> GetCurrent()
            => Ok(await _alertService.GetCurrentAsync());

        // Relance l'analyse et génère les alertes à jour
        [HttpPost("refresh")]
        public async Task<ActionResult<AlertSummaryDto>> Refresh()
            => Ok(await _alertService.RefreshAsync());


        // Ignore une alerte spécifique
        [HttpPatch("{id:int}/dismiss")]
        public async Task<IActionResult> Dismiss(int id)
        {
            await _alertService.DismissAsync(id);
            return NoContent();
        }

        // Ignore toutes les alertes de retard
        [HttpPatch("dismiss-all/delay")]
        public async Task<IActionResult> DismissAllDelay()
        {
            await _alertService.DismissAllByTypeAsync("Delay");
            return NoContent();
        }

        // Ignore toutes les alertes de goulot d'étranglement - charge des machines 
        [HttpPatch("dismiss-all/bottleneck")]
        public async Task<IActionResult> DismissAllBottleneck()
        {
            await _alertService.DismissAllByTypeAsync("Bottleneck");
            return NoContent();
        }
    }
}