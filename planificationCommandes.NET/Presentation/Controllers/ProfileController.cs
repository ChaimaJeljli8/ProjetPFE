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
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ProfileController : ControllerBase     // Hérite de ControllerBase pour bénéficier des fonctionnalités API ASP.NET Core comme :ok(), BadRequest(), NotFound(), etc.
    {
        private readonly IUserService _userService;

        public ProfileController(IUserService userService) => _userService = userService;

        // GET /api/Profile/me
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var user = await _userService.GetUserByIdAsync(userId);
            return user == null ? NotFound() : Ok(user);
        }

        // PUT /api/Profile/me
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileCommand cmd)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var (success, errors) = await _userService.UpdateProfileAsync(userId, cmd);
            if (!success) return BadRequest(errors);
            return Ok("Profil mis à jour avec succès.");
        }

        // PUT /api/Profile/me/password
        [HttpPut("me/password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordCommand cmd)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var (success, errors) = await _userService.ChangePasswordAsync(userId, cmd);
            if (!success) return BadRequest(errors);
            return Ok("Mot de passe modifié avec succès.");
        }
    }
}
