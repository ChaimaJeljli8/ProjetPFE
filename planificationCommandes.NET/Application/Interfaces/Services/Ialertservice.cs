using planificationCommandesBackend.Application.Dtos;

namespace planificationCommandesBackend.Application.Interfaces.Services
{
    // Implemented by AlertService in Domain.Services.
    // Used by: AlertsController, PlanningService (calls RefreshAsync
    // after each planning run to update machine load alerts).
    public interface IAlertService
    {
        Task<AlertSummaryDto> RefreshAsync();

        Task<AlertSummaryDto> GetCurrentAsync();

        Task DismissAsync(int id);
        Task DismissAllByTypeAsync(string type);
    }
}