using planificationCommandesBackend.Application.Dtos;
using planificationCommandesBackend.Application.Interfaces.Repositories;
using planificationCommandesBackend.Application.Interfaces.Services;
using planificationCommandesBackend.Domain.Entities;

namespace planificationCommandesBackend.Domain.Services
{

    public class ImportRowSkipDto
    {
        public int Row { get; set; }
        public string NumeroCommande { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }

    public class ImportServiceResult
    {
        public List<CommandeDto> Imported { get; set; } = new();
        public List<ImportRowSkipDto> Skipped { get; set; } = new();
    }


    public class CommandeService : ICommandeService
    {
        private readonly ICommandeRepository _commandeRepository;
        private readonly IRecetteRepository _recetteRepository;

        private static readonly string[] ValidStatuts =
            { "En attente", "En cours", "Terminé", "Annulé" }; // valeurs acceptées pour le champ Statut

        public CommandeService(
            ICommandeRepository commandeRepository,
            IRecetteRepository recetteRepository)
        {
            _commandeRepository = commandeRepository;
            _recetteRepository = recetteRepository;
        }

        public async Task<IEnumerable<CommandeDto>> GetAllAsync()
        {
            var commandes = await _commandeRepository.GetAllAsync();
            return commandes.Select(MapToDto);
        }

        public async Task<CommandeDto?> GetByIdAsync(int id)
        {
            var commande = await _commandeRepository.GetByIdAsync(id);
            return commande == null ? null : MapToDto(commande);
        }

        public async Task<IEnumerable<CommandeDto>> SearchAsync(CommandeSearchFilter filter)
        {
            var commandes = await _commandeRepository.SearchAsync(filter);
            return commandes.Select(MapToDto);
        }

        public async Task<CommandeDto> CreateAsync(CreateCommandeDto dto)
        {
            await ValidateCommandeAsync(dto.NumeroCommande, dto.RecetteId, dto.Urgence, dto.Statut);

            var commande = new Commande
            {
                NumeroCommande = dto.NumeroCommande.Trim().ToUpper(),
                DateExport = dto.DateExport,
                Urgence = dto.Urgence,
                Quantite = dto.Quantite,
                RecetteId = dto.RecetteId,
                Statut = dto.Statut,
                DateCreation = DateTime.UtcNow
            };

            var created = await _commandeRepository.AddAsync(commande);
            // Recharge depuis la base pour inclure la navigation Recette dans le DTO retourné
            var full = await _commandeRepository.GetByIdAsync(created.Id);
            return MapToDto(full!);
        }

        public async Task<ImportServiceResult> ImportAsync(IEnumerable<ImportCommandeDto> dtos)
        {
            var toImport = new List<Commande>();
            var skipped = new List<ImportRowSkipDto>();

            int rowIndex = 1;

            foreach (var dto in dtos)
            {
                rowIndex++;
                var numero = dto.NumeroCommande.Trim().ToUpper();
                var nomRecette = dto.NomRecette.Trim();

                if (await _commandeRepository.ExistsAsync(numero))
                {
                    skipped.Add(new ImportRowSkipDto
                    {
                        Row = rowIndex,
                        NumeroCommande = numero,
                        Reason = $"Le numéro de commande \"{numero}\" existe déjà (doublon)."
                    });
                    continue;
                }

                var recette = await _recetteRepository.GetByNameAsync(nomRecette);
                if (recette == null)
                {
                    skipped.Add(new ImportRowSkipDto
                    {
                        Row = rowIndex,
                        NumeroCommande = numero,
                        Reason = $"La recette \"{nomRecette}\" est introuvable."
                    });
                    continue;
                }

                toImport.Add(new Commande
                {
                    NumeroCommande = numero,
                    DateExport = dto.DateExport,
                    Urgence = dto.Urgence,
                    Quantite = dto.Quantite,
                    RecetteId = recette.Id,   
                    Statut = "En attente",
                    DateCreation = DateTime.UtcNow
                });
            }

            var created = await _commandeRepository.AddRangeAsync(toImport);

            return new ImportServiceResult
            {
                Imported = created.Select(MapToDto).ToList(),
                Skipped = skipped
            };
        }

        public async Task<CommandeDto> UpdateAsync(int id, UpdateCommandeDto dto)
        {
            var commande = await _commandeRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Commande non trouvée.");

            await ValidateCommandeAsync(
                dto.NumeroCommande, dto.RecetteId, dto.Urgence, dto.Statut, excludeId: id);

            commande.NumeroCommande = dto.NumeroCommande.Trim().ToUpper();
            commande.DateExport = dto.DateExport;
            commande.Urgence = dto.Urgence;
            commande.Quantite = dto.Quantite;
            commande.RecetteId = dto.RecetteId;
            commande.Statut = dto.Statut;
            commande.DateModification = DateTime.UtcNow;

            await _commandeRepository.UpdateAsync(commande);

            var full = await _commandeRepository.GetByIdAsync(id);
            return MapToDto(full!);
        }

        public async Task DeleteAsync(int id)
        {
            var commande = await _commandeRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Commande non trouvée.");

            await _commandeRepository.DeleteAsync(commande);
        }

        public async Task<CommandeStatistics> GetStatisticsAsync()
            => await _commandeRepository.GetStatisticsAsync();


        private async Task ValidateCommandeAsync(
            string numero, int recetteId, int urgence, string statut, int? excludeId = null)
        {
            if (await _commandeRepository.ExistsAsync(numero, excludeId))
                throw new InvalidOperationException(
                    $"Une commande avec le numéro \"{numero}\" existe déjà.");

            if (urgence < 1)
                throw new ArgumentException("L'urgence doit être un entier positif (≥ 1).");

            if (!ValidStatuts.Contains(statut))
                throw new ArgumentException(
                    $"Statut invalide. Valeurs acceptées : {string.Join(", ", ValidStatuts)}.");

            var recette = await _recetteRepository.GetByIdAsync(recetteId);
            if (recette == null)
                throw new ArgumentException($"La recette avec l'ID {recetteId} n'existe pas.");
        }

        private static CommandeDto MapToDto(Commande c) => new()
        {
            Id = c.Id,
            NumeroCommande = c.NumeroCommande,
            DateExport = c.DateExport,
            Urgence = c.Urgence,
            Quantite = c.Quantite,
            RecetteId = c.RecetteId,
            NomRecette = c.Recette?.NomRecette,
            Statut = c.Statut,
            DateCreation = c.DateCreation,
            DateModification = c.DateModification
        };
    }
}