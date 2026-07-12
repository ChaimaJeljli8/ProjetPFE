using Microsoft.AspNetCore.Identity;
using planificationCommandesBackend.Application.Commands;
using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Application.Interfaces.Repositories;
using planificationCommandesBackend.Application.Interfaces.Services;
using planificationCommandesBackend.Domain.Entities;

namespace planificationCommandesBackend.Domain.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepo;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailService _emailService;
        

        private const int MaxPhotoBytes = 2 * 1024 * 1024; // limite photo de profil : 2 Mo

        public UserService(
            IUserRepository userRepo,
            UserManager<ApplicationUser> userManager,
            IEmailService emailService,
            IConfiguration configuration)
        {
            _userRepo = userRepo;
            _userManager = userManager;
            _emailService = emailService;

        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _userRepo.GetAllAsync();
            var result = new List<UserDto>();

            foreach (var u in users)
            {
                var roles = await _userManager.GetRolesAsync(u);
                result.Add(MapToDto(u, roles.FirstOrDefault() ?? ""));
            }

            return result.OrderBy(u => u.LastName).ThenBy(u => u.FirstName);
        }

        public async Task<UserDto?> GetUserByIdAsync(string id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null) return null;
            var roles = await _userManager.GetRolesAsync(user);
            return MapToDto(user, roles.FirstOrDefault() ?? "");
        }

        public async Task<(bool Success, string[] Errors)> CreateUserAsync(CreateUserCommand cmd)
        {
            if (await _userRepo.GetByEmailAsync(cmd.Email) != null)
                return (false, new[] { "Un compte avec cet email existe déjà." });

            var allowedRoles = new[] { "Admin", "PlanificationResponsable", "Worker" };
            var role = allowedRoles.Contains(cmd.Role) ? cmd.Role : "Worker";

            var user = new ApplicationUser
            {
                FirstName = cmd.FirstName.Trim(),
                LastName = cmd.LastName.Trim(),
                Email = cmd.Email.Trim(),
                UserName = cmd.Email.Trim(),
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, cmd.Password);
            if (!result.Succeeded)
                return (false, result.Errors.Select(e => e.Description).ToArray());

            await _userManager.AddToRoleAsync(user, role);
            await _emailService.SendWelcomeEmailAsync(user.Email, user.FirstName);

            return (true, Array.Empty<string>());
        }

        public async Task<(bool Success, string[] Errors)> UpdateUserAsync(string id, UpdateUserCommand cmd)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null) return (false, new[] { "Utilisateur introuvable." });

            if (!string.Equals(user.Email, cmd.Email, StringComparison.OrdinalIgnoreCase))
            {
                var existing = await _userRepo.GetByEmailAsync(cmd.Email);
                if (existing != null && existing.Id != id)
                    return (false, new[] { "Cet email est déjà utilisé par un autre compte." });

                user.Email = cmd.Email.Trim();
                user.UserName = cmd.Email.Trim();
            }

            user.FirstName = cmd.FirstName.Trim();
            user.LastName = cmd.LastName.Trim();

            if (cmd.IsActive)
            {
                user.LockoutEnd = null;
                user.LockoutEnabled = false;
            }
            else
            {
                // Désactiver un compte = verrouillage permanent
                user.LockoutEnd = DateTimeOffset.MaxValue;
                user.LockoutEnabled = true;
            }

            if (!await _userRepo.UpdateAsync(user))
                return (false, new[] { "Erreur lors de la mise à jour." });

            var allowedRoles = new[] { "Admin", "PlanificationResponsable", "Worker" };
            var newRole = allowedRoles.Contains(cmd.Role) ? cmd.Role : "Worker";
            var currentRoles = await _userManager.GetRolesAsync(user);

            if (!currentRoles.Contains(newRole))
            {
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                await _userManager.AddToRoleAsync(user, newRole);
            }

            return (true, Array.Empty<string>());
        }

        public async Task<(bool Success, string[] Errors)> DeleteUserAsync(string id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null) return (false, new[] { "Utilisateur introuvable." });

            if (!await _userRepo.DeleteAsync(user))
                return (false, new[] { "Erreur lors de la suppression." });

            return (true, Array.Empty<string>());
        }

        public async Task<(bool Success, string[] Errors)> ResetUserPasswordAsync(string id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null) return (false, new[] { "Utilisateur introuvable." });

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encoded = Uri.EscapeDataString(token);
            var resetLink = $"http://localhost:4200/auth/reset-password?email={user.Email}&token={encoded}";

            await _emailService.SendPasswordResetEmailAsync(user.Email!, user.FirstName, resetLink);
            return (true, Array.Empty<string>());
        }

        public async Task<(bool Success, string[] Errors)> UpdateProfileAsync(string userId, UpdateProfileCommand cmd)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return (false, new[] { "Utilisateur introuvable." });

            user.FirstName = cmd.FirstName.Trim();
            user.LastName = cmd.LastName.Trim();

            if (cmd.ProfilePhoto != null)
            {
                if (cmd.ProfilePhoto == string.Empty)
                {
                    user.ProfilePhoto = null;
                }
                else
                {
                    if (!cmd.ProfilePhoto.StartsWith("data:image/"))
                        return (false, new[] { "Format de photo invalide." });

                    var base64Part = cmd.ProfilePhoto.Contains(',')
                        ? cmd.ProfilePhoto[(cmd.ProfilePhoto.IndexOf(',') + 1)..]
                        : cmd.ProfilePhoto;
                    // La photo est stockée en base64 directement en base — on estime la taille réelle depuis la longueur base64
                    var estimatedBytes = (long)(base64Part.Length * 0.75);
                    if (estimatedBytes > MaxPhotoBytes)
                        return (false, new[] { "La photo ne doit pas dépasser 2 Mo." });

                    user.ProfilePhoto = cmd.ProfilePhoto;
                }
            }

            if (!await _userRepo.UpdateAsync(user))
                return (false, new[] { "Erreur lors de la mise à jour." });

            return (true, Array.Empty<string>());
        }

        public async Task<(bool Success, string[] Errors)> ChangePasswordAsync(string userId, ChangePasswordCommand cmd)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null) return (false, new[] { "Utilisateur introuvable." });

            // UserManager gère le hachage — on ne change pas le mot de passe via le repo
            var Identityresult = await _userManager.ChangePasswordAsync(user, cmd.CurrentPassword, cmd.NewPassword);

            if (!Identityresult.Succeeded)
                return (false, Identityresult.Errors.Select(e => e.Description).ToArray());

            return (true, Array.Empty<string>());
        }

        private static UserDto MapToDto(ApplicationUser user, string role) => new()
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email ?? "",
            Role = role,
            IsActive = !user.LockoutEnabled
                               || user.LockoutEnd == null
                               || user.LockoutEnd < DateTimeOffset.UtcNow,
            ProfilePhoto = user.ProfilePhoto
        };
    }
}