using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Application.Interfaces.Services;
using planificationCommandesBackend.Domain.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace planificationCommandesBackend.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase     // Hérite de ControllerBase pour bénéficier des fonctionnalités API ASP.NET Core comme :ok(), BadRequest(), NotFound(), etc.
    {
        private readonly UserManager<ApplicationUser> _userManager; // UserManager pour gérer les utilisateurs (création, recherche, etc.) c'est une entity
        private readonly SignInManager<ApplicationUser> _signInManager;  // Gestion de la connexion et déconnexion
        private readonly IConfiguration _configuration; // Accès aux paramètres de configuration 
        private readonly IEmailService _emailService;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration, IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _emailService = emailService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            // Vérifie qu'aucun compte n'utilise déjà cet email
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
                return BadRequest("Un compte avec cet email existe déjà.");
            // Création du nouvel utilisateur
            var user = new ApplicationUser
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                UserName = dto.Email
            };
            // Enregistre l'utilisateur dans la base avec son mot de passe
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);
            Console.WriteLine($"Email: {_configuration["EmailSettings:SenderEmail"]}");
            Console.WriteLine($"Password loaded: {!string.IsNullOrEmpty(_configuration["EmailSettings:Password"])}");
            // Attribution du rôle sélectionné à l'utilisateur
            await _userManager.AddToRoleAsync(user, dto.Role);
            // Envoi d'un email de bienvenue après l'inscription
            await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName); 
            return Ok("Compte créé avec succès. Un email de bienvenue a été envoyé.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized("Email ou mot de passe incorrect.");
            // Vérifie les identifiants de connexion
            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: false);
            if (!result.Succeeded)
                return Unauthorized("Email ou mot de passe incorrect.");
            // Génère un JWT contenant les informations de l'utilisateur
            var token = await GenerateJwtToken(user);
            return Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    Role = (await _userManager.GetRolesAsync(user)).FirstOrDefault()
                }
            });
        }

        [HttpPost("logout")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<IActionResult> Logout()
        {
            // Déconnexion de l'utilisateur authentifié
            await _signInManager.SignOutAsync();
            return Ok("Déconnecté avec succès.");
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            // Retourne toujours le même message pour éviter de révéler l'existence d'un email
            if (user == null)
                return Ok("Si cet email existe, un lien de réinitialisation sera envoyé.");
            // Génère un jeton sécurisé de réinitialisation du mot de passe
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = Uri.EscapeDataString(token);
            // Construction du lien envoyé par email
            var resetLink = $"http://localhost:4200/auth/reset-password?email={user.Email}&token={encodedToken}";

            await _emailService.SendPasswordResetEmailAsync(user.Email!, user.FirstName, resetLink);
            return Ok("Si cet email existe, un lien de réinitialisation sera envoyé.");
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return BadRequest("Utilisateur introuvable.");

            // Décodage du jeton reçu depuis le lien de réinitialisation
            var decodedToken = Uri.UnescapeDataString(dto.Token);
            // Réinitialise le mot de passe avec le jeton fourni
            var result = await _userManager.ResetPasswordAsync(user, decodedToken, dto.NewPassword);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok("Mot de passe réinitialisé avec succès.");
        }

        private async Task<string> GenerateJwtToken(ApplicationUser user)
        {
            // Récupération du rôle de l'utilisateur
            var roles = await _userManager.GetRolesAsync(user);
            // Création des claims inclus dans le JWT
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName),
                new Claim(ClaimTypes.Role, roles.FirstOrDefault() ?? "Travailleur")
            };
            // Clé de signature utilisée pour sécuriser le jeton
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            // Date d'expiration du JWT
            var expiry = DateTime.UtcNow.AddDays(
                int.Parse(_configuration["Jwt:ExpiryInDays"]!));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expiry,
                signingCredentials: creds
            );
            // Génération et sérialisation du jeton JWT
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}