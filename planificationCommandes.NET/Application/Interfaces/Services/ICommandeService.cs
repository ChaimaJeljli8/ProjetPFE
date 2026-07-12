using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Application.Interfaces.Repositories;
using planificationCommandesBackend.Domain.Services;

namespace planificationCommandesBackend.Application.Interfaces.Services
{
    public interface ICommandeService
    {
        // Implemented by CommandeService in Domain.Services.
        // Used by: CommandesController.
        Task<IEnumerable<CommandeDto>> GetAllAsync();
        Task<CommandeDto?> GetByIdAsync(int id);
        Task<CommandeDto> CreateAsync(CreateCommandeDto dto);
        Task<ImportServiceResult> ImportAsync(IEnumerable<ImportCommandeDto> dtos);
        Task<CommandeDto> UpdateAsync(int id, UpdateCommandeDto dto);
        Task DeleteAsync(int id);
        Task<IEnumerable<CommandeDto>> SearchAsync(CommandeSearchFilter filter);
        Task<CommandeStatistics> GetStatisticsAsync();
    }
}