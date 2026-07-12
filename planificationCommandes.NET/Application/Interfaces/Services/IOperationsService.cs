namespace planificationCommandesBackend.Application.Interfaces.Services
{
    public interface IOperationsService
    {
        // Implemented by OperationsService in Domain.Services.
        // Used by: OperationsController - MachineService and RecetteService for validation 

        IEnumerable<string> GetAll();
    }
}