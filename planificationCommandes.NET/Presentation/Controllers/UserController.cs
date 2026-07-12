using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using planificationCommandesBackend.Application.Commands;
using planificationCommandesBackend.Application.Interfaces.Services;
using System.Security.Claims;

namespace planificationCommandesBackend.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public class UserController : ControllerBase 
    // Hérite de ControllerBase pour bénéficier des fonctionnalités API ASP.NET Core comme :ok(), BadRequest(), NotFound(), etc.
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService) => _userService = userService;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            return user == null ? NotFound("Utilisateur introuvable.") : Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateUserCommand cmd)
        {
            var (success, errors) = await _userService.CreateUserAsync(cmd);
            if (!success) return BadRequest(errors);
            return Ok("Utilisateur créé avec succès.");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateUserCommand cmd)
        {
            var (success, errors) = await _userService.UpdateUserAsync(id, cmd);
            if (!success) return BadRequest(errors);
            return Ok("Utilisateur mis à jour avec succès.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (callerId == id)
                return BadRequest("Vous ne pouvez pas supprimer votre propre compte.");

            var (success, errors) = await _userService.DeleteUserAsync(id);
            if (!success) return BadRequest(errors);
            return Ok("Utilisateur supprimé.");
        }

        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(string id)
        {
            var (success, errors) = await _userService.ResetUserPasswordAsync(id);
            if (!success) return BadRequest(errors);
            return Ok("Email de réinitialisation envoyé.");
        }
    }
}