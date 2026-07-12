using planificationCommandesBackend.Application.Dtos;

namespace planificationCommandesBackend.Application.Interfaces.Services
{
    public interface IReportService
    {
        // Implemented by ReportService in Domain.Services.
        // Used by: ReportsController.
        Task<DeadlineComplianceSummaryDto> GetReportAsync(DateTime? from, DateTime? to);
    }
}