using Microsoft.EntityFrameworkCore;
using planificationCommandesBackend.Application.Interfaces.Repositories;
using planificationCommandesBackend.Domain.Entities;
using planificationCommandesBackend.Infrastructure.Persistence;

namespace planificationCommandesBackend.Infrastructure.Repositories
{
    // Handles all Alert persistence
    public class AlertRepository : IAlertRepository
    {
        private readonly AppDbContext _db;

        public AlertRepository(AppDbContext db) => _db = db;

        public Task<List<Alert>> GetAllActiveAsync()
            => _db.Alerts
                  .Where(a => !a.IsDismissed)
                  .OrderBy(a => a.Severity == "critical" ? 0 : a.Severity == "warning" ? 1 : 2)
                  .ThenBy(a => a.GeneratedAt)
                  .ToListAsync();

        public Task<Alert?> GetByIdAsync(int id)
            => _db.Alerts.FirstOrDefaultAsync(a => a.Id == id);

        public async Task ReplaceAlertsAsync(IEnumerable<Alert> newAlerts)
        {
            var toDelete = await _db.Alerts
                                    .Where(a => !a.IsDismissed)
                                    .ToListAsync();

            _db.Alerts.RemoveRange(toDelete);
            await _db.Alerts.AddRangeAsync(newAlerts);
            await _db.SaveChangesAsync();
        }

        public async Task DismissAsync(int id)
        {
            var alert = await _db.Alerts.FindAsync(id);
            if (alert == null) return;

            alert.IsDismissed = true;
            alert.DismissedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        public async Task DismissAllByTypeAsync(string type)
        {
            var alerts = await _db.Alerts
                                  .Where(a => a.Type == type && !a.IsDismissed)
                                  .ToListAsync();

            var now = DateTime.UtcNow;
            foreach (var a in alerts)
            {
                a.IsDismissed = true;
                a.DismissedAt = now;
            }

            await _db.SaveChangesAsync();
        }

        public async Task<DateTime?> GetLastGeneratedAtAsync()
        {
            var latest = await _db.Alerts
                                  .OrderByDescending(a => a.GeneratedAt)
                                  .FirstOrDefaultAsync();
            return latest?.GeneratedAt;
        }
    }
}