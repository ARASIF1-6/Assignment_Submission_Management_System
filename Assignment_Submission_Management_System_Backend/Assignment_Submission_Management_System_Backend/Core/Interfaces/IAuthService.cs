using Assignment_Submission_Management_System_Backend.Modules.Auth.DTOs;

namespace Assignment_Submission_Management_System_Backend.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
}
