using planificationCommandesBackend.Application.Commands;
using planificationCommandesBackend.Application.Dtos;

namespace planificationCommandesBackend.Application.Interfaces.Services
{
    // Implemented by UserService in Domain.Services.
    public interface IUserService
    {
        //  Admin (CRUD) 
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto?> GetUserByIdAsync(string id);
        Task<(bool Success, string[] Errors)> CreateUserAsync(CreateUserCommand cmd);
        Task<(bool Success, string[] Errors)> UpdateUserAsync(string id, UpdateUserCommand cmd);
        Task<(bool Success, string[] Errors)> DeleteUserAsync(string id);
        Task<(bool Success, string[] Errors)> ResetUserPasswordAsync(string id);

        //  Self-service profile 
        Task<(bool Success, string[] Errors)> UpdateProfileAsync(string userId, UpdateProfileCommand cmd);
        Task<(bool Success, string[] Errors)> ChangePasswordAsync(string userId, ChangePasswordCommand cmd);
    }
}
