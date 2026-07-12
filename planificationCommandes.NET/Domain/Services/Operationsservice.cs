using planificationCommandesBackend.Application.Interfaces.Services;

namespace planificationCommandesBackend.Domain.Services
{

    public class OperationsService : IOperationsService
    {
        // Liste statique des opérations valides
        public static readonly string[] All =
        {
            "Javel",
            "Javellisation",
            "Snow Legs",
            "Poudre",
            "Rinçage",
            "Stonage",
            "Blanchiment",
            "Lavage"
        };

        public IEnumerable<string> GetAll() => All;
    }
}