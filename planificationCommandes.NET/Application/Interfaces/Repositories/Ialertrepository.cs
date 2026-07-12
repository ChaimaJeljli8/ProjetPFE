using planificationCommandesBackend.Domain.Entities;

namespace planificationCommandesBackend.Application.Interfaces.Repositories
{
    // Implemented by AlertRepository in Infrastructure.Repositories.
    public interface IAlertRepository
    {
        Task<List<Alert>> GetAllActiveAsync();
        Task<Alert?> GetByIdAsync(int id);

        Task ReplaceAlertsAsync(IEnumerable<Alert> newAlerts);

        Task DismissAsync(int id);
        Task DismissAllByTypeAsync(string type);  
        Task<DateTime?> GetLastGeneratedAtAsync();
    }
}