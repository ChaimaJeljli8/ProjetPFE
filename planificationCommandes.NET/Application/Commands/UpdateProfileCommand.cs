namespace planificationCommandesBackend.Application.Commands
{
    public class UpdateProfileCommand
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? ProfilePhoto { get; set; }
    }
}
