using planificationCommandesBackend.Domain.Entities;

namespace planificationCommandesBackend.Application.Interfaces.Repositories
{
    // Implemented by PlanningRepository in Infrastructure.Repositories.
    public interface IPlanningRepository
    {
        Task<Planning?> GetLatestWithRowsAsync();
    }
}