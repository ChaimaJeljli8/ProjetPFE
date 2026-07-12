using Microsoft.AspNetCore.Identity;

namespace planificationCommandesBackend.Domain.Entities
{
    public class ApplicationUser : IdentityUser 
     // Elle contient déjà toute la gestion utilisateur de base : // - Id - UserName - Email - PasswordHash - SecurityStamp - Lockout / Two-factor authentication, etc.
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;

        public string? ProfilePhoto { get; set; }    // Optional: Store profile photo as a URL or base64 string
    }
}