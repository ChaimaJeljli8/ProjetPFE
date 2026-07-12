using Microsoft.EntityFrameworkCore;
using planificationCommandesBackend.Application.Interfaces.Repositories;
using planificationCommandesBackend.Domain.Entities;
using planificationCommandesBackend.Infrastructure.Persistence;

namespace planificationCommandesBackend.Infrastructure.Repositories
{
    // Handles all Machine persistence
    public class MachineRepository : IMachineRepository
    {
        private readonly AppDbContext _context;

        public MachineRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Machine>> GetAllAsync()
        {
            return await _context.Machines
                .OrderBy(m => m.NomMachine)
                .ToListAsync();
        }

        public async Task<IEnumerable<Machine>> GetByStatutAsync(string statut)
        {
            return await _context.Machines
                .Where(m => m.Statut.ToLower() == statut.ToLower())
                .OrderBy(m => m.NomMachine)
                .ToListAsync();
        }

        public async Task<Machine?> GetByIdAsync(int id)
        {
            return await _context.Machines.FindAsync(id);
        }

        public async Task<bool> ExistsAsync(string nomMachine, int? excludeId = null)
        {
            var query = _context.Machines
                .Where(m => m.NomMachine.ToLower() == nomMachine.Trim().ToLower());

            if (excludeId.HasValue)
                query = query.Where(m => m.Id != excludeId.Value);

            return await query.AnyAsync();
        }

        public async Task<Machine> AddAsync(Machine machine)
        {
            _context.Machines.Add(machine);
            await _context.SaveChangesAsync();
            return machine;
        }

        public async Task UpdateAsync(Machine machine)
        {
            _context.Machines.Update(machine);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Machine machine)
        {
            _context.Machines.Remove(machine);
            await _context.SaveChangesAsync();
        }

        public async Task<(int total, int fonctionnels, int nonFonctionnels)> GetStatisticsAsync()
        {
            var total = await _context.Machines.CountAsync();
            var fonctionnels = await _context.Machines.CountAsync(m => m.Statut == "Fonctionnel");
            var nonFonctionnels = await _context.Machines.CountAsync(m => m.Statut == "Non fonctionnel");
            return (total, fonctionnels, nonFonctionnels);
        }
    }
}