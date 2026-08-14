using Assignment_Submission_Management_System_Backend.Modules.TeacherClassSubjects.DTOs;

namespace Assignment_Submission_Management_System_Backend.Core.Interfaces;

public interface ITeacherClassSubjectService
{
    Task<IEnumerable<TeacherClassSubjectResponseDto>> GetAllAsync();
    Task<TeacherClassSubjectResponseDto> GetByIdAsync(Guid id);
    Task<TeacherClassSubjectResponseDto> AssignTeacherAsync(AssignTeacherRequestDto request);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<TeacherClassSubjectResponseDto>> GetByTeacherIdAsync(Guid teacherId);
    Task<IEnumerable<TeacherClassSubjectResponseDto>> GetByClassIdAsync(Guid classId);
}
