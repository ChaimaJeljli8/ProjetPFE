using planificationCommandesBackend.Domain.Entities;

namespace planificationCommandesBackend.Application.Interfaces.Repositories
{
    // Implemented by MachineRepository in Infrastructure.Repositories.
    public interface IMachineRepository
    {
        Task<IEnumerable<Machine>> GetAllAsync();
        Task<IEnumerable<Machine>> GetByStatutAsync(string statut);
        Task<Machine?> GetByIdAsync(int id);
        Task<bool> ExistsAsync(string nomMachine, int? excludeId = null);
        Task<Machine> AddAsync(Machine machine);
        Task UpdateAsync(Machine machine);
        Task DeleteAsync(Machine machine);
        Task<(int total, int fonctionnels, int nonFonctionnels)> GetStatisticsAsync();
    }
}