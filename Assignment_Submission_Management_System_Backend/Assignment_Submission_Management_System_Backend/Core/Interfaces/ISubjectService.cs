using Assignment_Submission_Management_System_Backend.Modules.Subjects.DTOs;

namespace Assignment_Submission_Management_System_Backend.Core.Interfaces;

public interface ISubjectService
{
    Task<IEnumerable<SubjectResponseDto>> GetAllAsync();
    Task<SubjectResponseDto> GetByIdAsync(Guid id);
    Task<SubjectResponseDto> CreateAsync(CreateSubjectRequestDto request);
    Task<SubjectResponseDto> UpdateAsync(Guid id, UpdateSubjectRequestDto request);
    Task DeleteAsync(Guid id);
}
