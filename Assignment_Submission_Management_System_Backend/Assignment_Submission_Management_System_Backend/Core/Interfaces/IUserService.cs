using Assignment_Submission_Management_System_Backend.Modules.Users.DTOs;

namespace Assignment_Submission_Management_System_Backend.Core.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserResponseDto>> GetAllAsync();
    Task<UserResponseDto> GetByIdAsync(Guid id);
    Task<UserResponseDto> CreateAsync(CreateUserRequestDto request);
    Task<UserResponseDto> UpdateAsync(Guid id, UpdateUserRequestDto request);
    Task DeleteAsync(Guid id);
    Task EnrollStudentAsync(EnrollStudentRequestDto request);
    Task RemoveEnrollmentAsync(Guid enrollmentId);
    Task<IEnumerable<EnrollmentResponseDto>> GetStudentEnrollmentsAsync(Guid studentId);
}
