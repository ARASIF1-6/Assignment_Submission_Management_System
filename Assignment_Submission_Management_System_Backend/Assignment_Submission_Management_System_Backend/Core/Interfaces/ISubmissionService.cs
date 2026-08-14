using Assignment_Submission_Management_System_Backend.Modules.Submissions.DTOs;

namespace Assignment_Submission_Management_System_Backend.Core.Interfaces;

public interface ISubmissionService
{
    Task<IEnumerable<SubmissionResponseDto>> GetAllAsync(Guid? userId, string? role, Guid? assignmentId);
    Task<SubmissionResponseDto> GetByIdAsync(Guid id, Guid? userId, string? role);
    Task<SubmissionResponseDto> SubmitAsync(CreateSubmissionRequestDto request, Guid studentId);
    Task<SubmissionResponseDto> UpdateAsync(Guid id, UpdateSubmissionRequestDto request, Guid studentId);
    Task<SubmissionResponseDto> GradeAsync(Guid id, GradeSubmissionRequestDto request, Guid teacherId, string role);
    Task<SubmissionResponseDto> UpdateStatusAsync(Guid id, UpdateSubmissionStatusRequestDto request, Guid teacherId, string role);
}
