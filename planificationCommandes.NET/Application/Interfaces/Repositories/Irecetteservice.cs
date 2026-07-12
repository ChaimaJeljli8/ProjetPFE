using planificationCommandesBackend.Domain.Entities;

namespace planificationCommandesBackend.Application.Interfaces.Repositories
{
    // Implemented by RecetteRepository in Infrastructure.Repositories.
    public interface IRecetteRepository
    {
        Task<IEnumerable<Recette>> GetAllAsync();
        Task<Recette?> GetByIdAsync(int id);
        Task<Recette?> GetByNameAsync(string nomRecette);
        Task<Recette?> GetByIdWithOperationsAsync(int id);
        Task<bool> ExistsAsync(string nomRecette, int? excludeId = null);
        Task<Recette> AddAsync(Recette recette);
        Task UpdateAsync(Recette recette);
        Task DeleteAsync(Recette recette);
        Task<bool> IsUsedByCommandesAsync(int recetteId);
    }
}