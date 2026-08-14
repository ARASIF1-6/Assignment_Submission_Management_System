using System.ComponentModel.DataAnnotations;

namespace Assignment_Submission_Management_System_Backend.Modules.TeacherClassSubjects.DTOs;

public class AssignTeacherRequestDto
{
    [Required]
    public Guid ClassId { get; set; }

    [Required]
    public Guid SubjectId { get; set; }

    [Required]
    public Guid TeacherId { get; set; }
}

public class TeacherClassSubjectResponseDto
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public Guid SubjectId { get; set; }
    public string SubjectName { get; set; } = string.Empty;
    public Guid TeacherId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
