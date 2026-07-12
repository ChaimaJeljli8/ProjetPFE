using planificationCommandesBackend.Application.Dtos;


namespace planificationCommandesBackend.Application.Interfaces.Services
{
    public interface IRecetteService
    {
        // Implemented by RecetteService in Domain.Services.
        // Used by: RecettesController.
        Task<IEnumerable<RecetteDto>> GetAllAsync();
        Task<RecetteDto?> GetByIdAsync(int id);
        Task<RecetteDto> CreateAsync(CreateRecetteDto dto);
        Task<RecetteDto> UpdateAsync(int id, UpdateRecetteDto dto);
        Task DeleteAsync(int id);
    }
}