using Microsoft.EntityFrameworkCore;
using planificationCommandesBackend.Application.Interfaces.Repositories;
using planificationCommandesBackend.Domain.Entities;
using planificationCommandesBackend.Infrastructure.Persistence;

namespace planificationCommandesBackend.Infrastructure.Repositories
{
    public class PlanningRepository : IPlanningRepository
    {
        private readonly AppDbContext _db;

        public PlanningRepository(AppDbContext db) => _db = db;

        // fetching the most recent planning with its rows, used by AlertService to compute machine load.
        public Task<Planning?> GetLatestWithRowsAsync()
            => _db.Plannings
                  .Include(p => p.Rows)
                  .OrderByDescending(p => p.DateGeneration)
                  .FirstOrDefaultAsync();
    }
}