namespace planificationCommandesBackend.Application.Interfaces.Services
{
    public interface IEmailService
    {
        // Implemented by EmailService in Domain.Services.
        // Used by: AuthController and UserService 
        Task SendWelcomeEmailAsync(string toEmail, string firstName);
        Task SendPasswordResetEmailAsync(string toEmail, string firstName, string resetLink);
    }
}