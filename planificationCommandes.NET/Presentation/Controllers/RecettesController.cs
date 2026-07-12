using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Application.Interfaces.Services;

namespace planificationCommandesBackend.Presentation.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,PlanificationResponsable")]
    public class RecettesController : ControllerBase     // Hérite de ControllerBase pour bénéficier des fonctionnalités API ASP.NET Core comme :ok(), BadRequest(), NotFound(), etc.
    {
        private readonly IRecetteService _recetteService;

        public RecettesController(IRecetteService recetteService)
        {
            _recetteService = recetteService;
        }

        // GET: api/Recettes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecetteDto>>> GetRecettes()
        {
            var recettes = await _recetteService.GetAllAsync();
            return Ok(recettes);
        }

        // GET: api/Recettes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RecetteDto>> GetRecette(int id)
        {
            var recette = await _recetteService.GetByIdAsync(id);
            if (recette == null)
                return NotFound(new { message = "Recette non trouvée" });

            return Ok(recette);
        }

        // POST: api/Recettes
        [HttpPost]
        public async Task<ActionResult<RecetteDto>> CreateRecette([FromBody] CreateRecetteDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _recetteService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetRecette), new { id = created.Id }, created);
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

        // PUT: api/Recettes/5
        [HttpPut("{id}")]
        public async Task<ActionResult<RecetteDto>> UpdateRecette(int id, [FromBody] UpdateRecetteDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _recetteService.UpdateAsync(id, dto);
                return Ok(new { message = "Recette mise à jour avec succès", recette = updated });
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

        // DELETE: api/Recettes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecette(int id)
        {
            try
            {
                await _recetteService.DeleteAsync(id);
                return Ok(new { message = "Recette supprimée avec succès" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }
    }
}