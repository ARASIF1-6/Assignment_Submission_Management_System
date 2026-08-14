using System.ComponentModel.DataAnnotations;
using Assignment_Submission_Management_System_Backend.Core.Enums;

namespace Assignment_Submission_Management_System_Backend.Modules.Assignments.DTOs;

public class CreateAssignmentRequestDto
{
    [Required]
    public Guid TeacherClassSubjectId { get; set; }

    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime Deadline { get; set; }

    [Required, Range(0.01, 1000)]
    public decimal MaxMarks { get; set; }

    public bool AllowResubmission { get; set; } = true;
}

public class UpdateAssignmentRequestDto
{
    [Required, MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime Deadline { get; set; }

    [Required, Range(0.01, 1000)]
    public decimal MaxMarks { get; set; }

    public bool AllowResubmission { get; set; } = true;
}

public class AssignmentResponseDto
{
    public Guid Id { get; set; }
    public Guid TeacherClassSubjectId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public decimal MaxMarks { get; set; }
    public AssignmentStatus Status { get; set; }
    public bool AllowResubmission { get; set; }
    public string CreatedByTeacherName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
