using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Application.Interfaces.Repositories;
using planificationCommandesBackend.Application.Interfaces.Services;
using planificationCommandesBackend.Domain.Entities;

namespace planificationCommandesBackend.Domain.Services
{
    public class MachineService : IMachineService
    {
        private readonly IMachineRepository _machineRepository;

        private static readonly string[] ValidStatuts = { "Fonctionnel", "Non fonctionnel" };
        // Réutilise la liste centrale définie dans OperationsService
        private static readonly string[] ValidOperations = OperationsService.All;

        public MachineService(IMachineRepository machineRepository)
        {
            _machineRepository = machineRepository;
        }

        public async Task<IEnumerable<MachineDto>> GetAllAsync()
        {
            var machines = await _machineRepository.GetAllAsync();
            return machines.Select(MapToDto);
        }

        public async Task<IEnumerable<MachineDto>> GetByStatutAsync(string statut)
        {
            var machines = await _machineRepository.GetByStatutAsync(statut);
            return machines.Select(MapToDto);
        }

        public async Task<MachineDto?> GetByIdAsync(int id)
        {
            var machine = await _machineRepository.GetByIdAsync(id);
            return machine == null ? null : MapToDto(machine);
        }

        public async Task<MachineDto> CreateAsync(CreateMachineDto dto)
        {
            Validate(dto.NomMachine, dto.CapaciteMax, dto.Statut, dto.Operations);

            if (await _machineRepository.ExistsAsync(dto.NomMachine))
                throw new InvalidOperationException(
                    $"Une machine nommée \"{dto.NomMachine}\" existe déjà. Veuillez choisir un nom différent.");

            var machine = new Machine
            {
                NomMachine = dto.NomMachine.Trim(),
                CapaciteMax = dto.CapaciteMax,
                Statut = dto.Statut,
                // Les opérations sont stockées en base sous forme de chaîne separée par des virgules
                Operations = dto.Operations?.Trim()
            };

            var created = await _machineRepository.AddAsync(machine);
            return MapToDto(created);
        }

        public async Task<MachineDto> UpdateAsync(int id, UpdateMachineDto dto)
        {
            var existing = await _machineRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Machine non trouvée.");

            Validate(dto.NomMachine, dto.CapaciteMax, dto.Statut, dto.Operations);

            if (await _machineRepository.ExistsAsync(dto.NomMachine, excludeId: id))
                throw new InvalidOperationException(
                    $"Une machine nommée \"{dto.NomMachine}\" existe déjà. Veuillez choisir un nom différent.");

            existing.NomMachine = dto.NomMachine.Trim();
            existing.CapaciteMax = dto.CapaciteMax;
            existing.Statut = dto.Statut;
            existing.Operations = dto.Operations?.Trim();

            await _machineRepository.UpdateAsync(existing);
            return MapToDto(existing);
        }

        public async Task DeleteAsync(int id)
        {
            var machine = await _machineRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Machine non trouvée.");

            await _machineRepository.DeleteAsync(machine);
        }

        public async Task<MachineStatisticsDto> GetStatisticsAsync()
        {
            var (total, fonctionnels, nonFonctionnels) = await _machineRepository.GetStatisticsAsync();
            return new MachineStatisticsDto
            {
                TotalMachines = total,
                Fonctionnels = fonctionnels,
                NonFonctionnels = nonFonctionnels
            };
        }

        //  Validation 

        private static void Validate(string nomMachine, int capaciteMax, string statut, string? operations)
        {
            if (string.IsNullOrWhiteSpace(nomMachine))
                throw new ArgumentException("Le nom de la machine est obligatoire.");

            if (!ValidStatuts.Contains(statut))
                throw new ArgumentException(
                    $"Statut invalide. Les valeurs acceptées sont : {string.Join(", ", ValidStatuts)}.");

            if (capaciteMax <= 0)
                throw new ArgumentException("La capacité maximale doit être un nombre entier positif (> 0).");

            if (string.IsNullOrWhiteSpace(operations))
                throw new ArgumentException("Veuillez sélectionner au moins une opération.");

            var ops = operations
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(o => o.Trim())
                .ToList();

            var invalid = ops.Except(ValidOperations, StringComparer.Ordinal).ToList();
            if (invalid.Any())
                throw new ArgumentException(
                    $"Opération(s) invalide(s) : {string.Join(", ", invalid)}. " +
                    $"Valeurs acceptées : {string.Join(", ", ValidOperations)}.");
        }


        private static MachineDto MapToDto(Machine m) => new()
        {
            Id = m.Id,
            NomMachine = m.NomMachine,
            CapaciteMax = m.CapaciteMax,
            Statut = m.Statut,
            Operations = m.Operations
        };
    }
}