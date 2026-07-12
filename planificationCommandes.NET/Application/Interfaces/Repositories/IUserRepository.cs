using planificationCommandesBackend.Domain.Entities;

namespace planificationCommandesBackend.Application.Interfaces.Repositories
{
    // Implemented by UserRepository in Infrastructure.Repositories
    public interface IUserRepository
    {
        Task<IEnumerable<ApplicationUser>> GetAllAsync();
        Task<ApplicationUser?> GetByIdAsync(string id);
        Task<ApplicationUser?> GetByEmailAsync(string email);
        Task<bool> UpdateAsync(ApplicationUser user);
        Task<bool> DeleteAsync(ApplicationUser user);
    }
}
