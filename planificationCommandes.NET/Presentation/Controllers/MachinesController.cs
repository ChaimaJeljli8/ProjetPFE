using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Application.Interfaces.Services;

namespace planificationCommandesBackend.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,PlanificationResponsable")]
    public class MachinesController : ControllerBase     // Hérite de ControllerBase pour bénéficier des fonctionnalités API ASP.NET Core comme :ok(), BadRequest(), NotFound(), etc.
    { 
        private readonly IMachineService _machineService;

        public MachinesController(IMachineService machineService)
        {
            _machineService = machineService;
        }

        // GET: api/Machines
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MachineDto>>> GetMachines()
        {
            var machines = await _machineService.GetAllAsync();
            return Ok(machines);
        }

        // GET: api/Machines/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MachineDto>> GetMachine(int id)
        {
            var machine = await _machineService.GetByIdAsync(id);
            if (machine == null)
                return NotFound(new { message = "Machine non trouvée" });

            return Ok(machine);
        }

        // GET: api/Machines/ByStatut/Fonctionnel
        [HttpGet("ByStatut/{statut}")]
        public async Task<ActionResult<IEnumerable<MachineDto>>> GetMachinesByStatut(string statut)
        {
            var machines = await _machineService.GetByStatutAsync(statut);
            return Ok(machines);
        }

        // POST: api/Machines
        [HttpPost]
        public async Task<ActionResult<MachineDto>> CreateMachine([FromBody] CreateMachineDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _machineService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetMachine), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/Machines/5
        [HttpPut("{id}")]
        public async Task<ActionResult<MachineDto>> UpdateMachine(int id, [FromBody] UpdateMachineDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _machineService.UpdateAsync(id, dto);
                return Ok(new { message = "Machine mise à jour avec succès", machine = updated });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/Machines/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMachine(int id)
        {
            try
            {
                var machine = await _machineService.GetByIdAsync(id);
                if (machine == null)
                    return NotFound(new { message = "Machine non trouvée" });

                await _machineService.DeleteAsync(id);
                return Ok(new { message = "Machine supprimée avec succès", machine });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // GET: api/Machines/Statistics
        [HttpGet("Statistics")]
        public async Task<ActionResult<MachineStatisticsDto>> GetStatistics()
        {
            var stats = await _machineService.GetStatisticsAsync();
            return Ok(stats);
        }
    }
}