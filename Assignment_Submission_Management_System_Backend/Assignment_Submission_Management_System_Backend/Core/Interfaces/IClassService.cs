using Assignment_Submission_Management_System_Backend.Modules.Classes.DTOs;

namespace Assignment_Submission_Management_System_Backend.Core.Interfaces;

public interface IClassService
{
    Task<IEnumerable<ClassResponseDto>> GetAllAsync();
    Task<ClassResponseDto> GetByIdAsync(Guid id);
    Task<ClassResponseDto> CreateAsync(CreateClassRequestDto request);
    Task<ClassResponseDto> UpdateAsync(Guid id, UpdateClassRequestDto request);
    Task DeleteAsync(Guid id);
}
