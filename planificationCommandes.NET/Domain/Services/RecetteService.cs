using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Application.Interfaces.Repositories;
using planificationCommandesBackend.Application.Interfaces.Services;
using planificationCommandesBackend.Domain.Entities;

namespace planificationCommandesBackend.Domain.Services
{
    public class RecetteService : IRecetteService
    {
        private readonly IRecetteRepository _recetteRepository;

        private static readonly string[] ValidOperations = OperationsService.All;

        public RecetteService(IRecetteRepository recetteRepository)
        {
            _recetteRepository = recetteRepository;
        }

        public async Task<IEnumerable<RecetteDto>> GetAllAsync()
        {
            var recettes = await _recetteRepository.GetAllAsync();
            return recettes.Select(MapToDto);
        }

        public async Task<RecetteDto?> GetByIdAsync(int id)
        {
            var recette = await _recetteRepository.GetByIdWithOperationsAsync(id);
            return recette == null ? null : MapToDto(recette);
        }

        public async Task<RecetteDto> CreateAsync(CreateRecetteDto dto)
        {
            await ValidateRecetteAsync(dto.NomRecette, dto.Operations);

            var recette = new Recette
            {
                NomRecette = dto.NomRecette.Trim(),
                Operations = dto.Operations
                    .OrderBy(o => o.Ordre)
                    .Select(o => new OperationRecette
                    {
                        Ordre = o.Ordre,
                        NomOperation = o.NomOperation.Trim(),
                        DureeMinutes = o.DureeMinutes,
                        QuantiteLot = o.QuantiteLot,
                        TempsChargementMinutes = o.TempsChargementMinutes,
                        TempsDecharementMinutes = o.TempsDecharementMinutes
                    }).ToList()
            };

            var created = await _recetteRepository.AddAsync(recette);
            // Recharge depuis la base pour inclure les opérations triées dans le DTO retourné
            var full = await _recetteRepository.GetByIdWithOperationsAsync(created.Id);
            return MapToDto(full!);
        }

        public async Task<RecetteDto> UpdateAsync(int id, UpdateRecetteDto dto)
        {
            var existing = await _recetteRepository.GetByIdWithOperationsAsync(id)
                ?? throw new KeyNotFoundException("Recette non trouvée.");

            await ValidateRecetteAsync(dto.NomRecette, dto.Operations, excludeId: id);

            existing.NomRecette = dto.NomRecette.Trim();
            existing.Operations = dto.Operations
                .OrderBy(o => o.Ordre)
                .Select(o => new OperationRecette
                {
                    Ordre = o.Ordre,
                    NomOperation = o.NomOperation.Trim(),
                    DureeMinutes = o.DureeMinutes,
                    QuantiteLot = o.QuantiteLot,
                    TempsChargementMinutes = o.TempsChargementMinutes,
                    TempsDecharementMinutes = o.TempsDecharementMinutes
                }).ToList();

            await _recetteRepository.UpdateAsync(existing);

            var full = await _recetteRepository.GetByIdWithOperationsAsync(id);
            return MapToDto(full!);
        }

        public async Task DeleteAsync(int id)
        {
            var recette = await _recetteRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Recette non trouvée.");

            if (await _recetteRepository.IsUsedByCommandesAsync(id))
                throw new InvalidOperationException(
                    "Cette recette est utilisée par des commandes et ne peut pas être supprimée.");

            await _recetteRepository.DeleteAsync(recette);
        }


        private async Task ValidateRecetteAsync(
            string nomRecette,
            IEnumerable<CreateOperationRecetteDto> operations,
            int? excludeId = null)
        {
            if (await _recetteRepository.ExistsAsync(nomRecette, excludeId))
                throw new InvalidOperationException(
                    $"Une recette nommée \"{nomRecette}\" existe déjà.");

            var ops = operations.ToList();

            if (!ops.Any())
                throw new ArgumentException("La recette doit contenir au moins une opération.");

            foreach (var op in ops)
            {
                var trimmed = op.NomOperation?.Trim() ?? string.Empty;
                if (!ValidOperations.Contains(trimmed, StringComparer.Ordinal))
                    throw new ArgumentException(
                        $"Opération {op.Ordre} — \"{trimmed}\" n'est pas une opération valide. " +
                        $"Valeurs acceptées : {string.Join(", ", ValidOperations)}.");
            }
            // Vérifie que deux opérations n'ont pas le même numéro d'ordre
            var duplicateOrdres = ops
                .GroupBy(o => o.Ordre)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicateOrdres.Any())
                throw new ArgumentException(
                    $"L'ordre des opérations doit être unique. Doublons trouvés : {string.Join(", ", duplicateOrdres)}.");
        }


        private static RecetteDto MapToDto(Recette r) => new()
        {
            Id = r.Id,
            NomRecette = r.NomRecette,
            Operations = r.Operations
                .OrderBy(o => o.Ordre)
                .Select(o => new OperationRecetteDto
                {
                    Id = o.Id,
                    Ordre = o.Ordre,
                    NomOperation = o.NomOperation,
                    DureeMinutes = o.DureeMinutes,
                    QuantiteLot = o.QuantiteLot,
                    TempsChargementMinutes = o.TempsChargementMinutes,
                    TempsDecharementMinutes = o.TempsDecharementMinutes
                }).ToList()
        };
    }
}