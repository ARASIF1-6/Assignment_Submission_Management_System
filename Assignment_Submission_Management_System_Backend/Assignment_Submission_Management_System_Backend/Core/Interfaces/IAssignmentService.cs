using Assignment_Submission_Management_System_Backend.Modules.Assignments.DTOs;

namespace Assignment_Submission_Management_System_Backend.Core.Interfaces;

public interface IAssignmentService
{
    Task<IEnumerable<AssignmentResponseDto>> GetAllAsync(Guid? userId, string? role);
    Task<AssignmentResponseDto> GetByIdAsync(Guid id, Guid? userId, string? role);
    Task<AssignmentResponseDto> CreateAsync(CreateAssignmentRequestDto request, Guid teacherId);
    Task<AssignmentResponseDto> UpdateAsync(Guid id, UpdateAssignmentRequestDto request, Guid teacherId, string role);
    Task DeleteAsync(Guid id, Guid teacherId, string role);
    Task<AssignmentResponseDto> PublishAsync(Guid id, Guid teacherId, string role);
}
