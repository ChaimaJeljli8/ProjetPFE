using Microsoft.AspNetCore.Identity;
using planificationCommandesBackend.Application.Interfaces.Repositories;
using planificationCommandesBackend.Domain.Entities;

namespace planificationCommandesBackend.Infrastructure.Repositories
{
    // UserManager instead of AppDbContext directly, because Identity manages
    // its own hashing, locking, and user store. This repo wraps UserManager
    // calls so the rest of the app doesn't depend on Identity internals.
    public class UserRepository : IUserRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserRepository(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public Task<IEnumerable<ApplicationUser>> GetAllAsync()
        {
            IEnumerable<ApplicationUser> users = _userManager.Users.ToList();
            return Task.FromResult(users);
        }

        public async Task<ApplicationUser?> GetByIdAsync(string id)
            => await _userManager.FindByIdAsync(id);

        public async Task<ApplicationUser?> GetByEmailAsync(string email)
            => await _userManager.FindByEmailAsync(email);

        public async Task<bool> UpdateAsync(ApplicationUser user)
        {
            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }

        public async Task<bool> DeleteAsync(ApplicationUser user)
        {
            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }
    }
}