using Microsoft.EntityFrameworkCore;
using planificationCommandesBackend.Application.Interfaces.Repositories;
using planificationCommandesBackend.Domain.Entities;
using planificationCommandesBackend.Infrastructure.Persistence;

namespace planificationCommandesBackend.Infrastructure.Repositories
{
    public class RecetteRepository : IRecetteRepository
    {
        private readonly AppDbContext _context;

        public RecetteRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Recette>> GetAllAsync()
        {
            return await _context.Recettes
                .Include(r => r.Operations)
                .OrderBy(r => r.NomRecette)
                .ToListAsync();
        }

        public async Task<Recette?> GetByIdAsync(int id)
        {
            return await _context.Recettes.FindAsync(id);
        }

        public async Task<Recette?> GetByIdWithOperationsAsync(int id)
        {
            return await _context.Recettes
                .Include(r => r.Operations.OrderBy(o => o.Ordre))
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<Recette?> GetByNameAsync(string nomRecette)
        {
            return await _context.Recettes
                .FirstOrDefaultAsync(r => r.NomRecette.ToLower() == nomRecette.ToLower());
        }

        public async Task<bool> ExistsAsync(string nomRecette, int? excludeId = null)
        {
            var query = _context.Recettes
                .Where(r => r.NomRecette.ToLower() == nomRecette.Trim().ToLower());

            if (excludeId.HasValue)
                query = query.Where(r => r.Id != excludeId.Value);

            return await query.AnyAsync();
        }

        public async Task<Recette> AddAsync(Recette recette)
        {
            _context.Recettes.Add(recette);
            await _context.SaveChangesAsync();
            return recette;
        }

        public async Task UpdateAsync(Recette recette)
        {
            var existingOps = await _context.OperationsRecette
                .Where(o => o.RecetteId == recette.Id)
                .ToListAsync();
            _context.OperationsRecette.RemoveRange(existingOps);

            _context.Recettes.Update(recette);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Recette recette)
        {
            _context.Recettes.Remove(recette);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> IsUsedByCommandesAsync(int recetteId)
        {
            return await _context.Commandes.AnyAsync(c => c.RecetteId == recetteId);
        }
    }
}