namespace planificationCommandesBackend.Application.Commands
{
    public class ChangePasswordCommand
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;

    }
}
