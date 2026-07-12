using planificationCommandesBackend.Application.Dtos;

namespace planificationCommandesBackend.Application.Interfaces.Services
{
    public interface IMachineService
    {
        // Implemented by MachineService in Domain.Services.
        // Used by: MachinesController.
        Task<IEnumerable<MachineDto>> GetAllAsync();
        Task<IEnumerable<MachineDto>> GetByStatutAsync(string statut);
        Task<MachineDto?> GetByIdAsync(int id);
        Task<MachineDto> CreateAsync(CreateMachineDto dto);
        Task<MachineDto> UpdateAsync(int id, UpdateMachineDto dto);
        Task DeleteAsync(int id);
        Task<MachineStatisticsDto> GetStatisticsAsync();
    }
}