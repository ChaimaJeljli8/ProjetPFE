using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using planificationCommandesBackend.Application.Interfaces.Services;

namespace planificationCommandesBackend.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,PlanificationResponsable")]
    public class OperationsController : ControllerBase     // Hérite de ControllerBase pour bénéficier des fonctionnalités API ASP.NET Core comme :ok(), BadRequest(), NotFound(), etc.
    {
        private readonly IOperationsService _operationsService;

        public OperationsController(IOperationsService operationsService)
        {
            _operationsService = operationsService;
        }

        // GET: api/Operations
        [HttpGet]
        public ActionResult<IEnumerable<string>> GetOperations()
        {
            return Ok(_operationsService.GetAll());
        }
    }
}