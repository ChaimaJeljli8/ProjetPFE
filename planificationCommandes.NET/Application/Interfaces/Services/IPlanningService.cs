using planificationCommandesBackend.Application.Dtos;

namespace planificationCommandesBackend.Application.Interfaces.Services
{
    public interface IPlanningService
    {
        // Implemented by PlanningService in Domain.Services.
        // Used by: PlanningController.
        Task<PlanningDetailDto> RunAndSaveAsync(string bearerToken, TriggerPlanningDto req);
        Task<List<PlanningSummaryDto>> GetAllSummariesAsync();
        Task<PlanningDetailDto?> GetByIdAsync(int id);
        Task<byte[]> ExportExcelAsync(int id);
        Task<byte[]> ExportPdfAsync(int id);
    }
}
