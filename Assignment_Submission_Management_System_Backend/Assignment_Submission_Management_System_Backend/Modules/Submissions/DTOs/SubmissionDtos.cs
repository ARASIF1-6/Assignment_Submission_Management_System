using System.ComponentModel.DataAnnotations;
using Assignment_Submission_Management_System_Backend.Core.Enums;

namespace Assignment_Submission_Management_System_Backend.Modules.Submissions.DTOs;

public class CreateSubmissionRequestDto
{
    [Required]
    public Guid AssignmentId { get; set; }

    [Required, MinLength(1)]
    public string Answer { get; set; } = string.Empty;
}

public class UpdateSubmissionRequestDto
{
    [Required, MinLength(1)]
    public string Answer { get; set; } = string.Empty;
}

public class GradeSubmissionRequestDto
{
    [Required, Range(0, 1000)]
    public decimal Marks { get; set; }

    public string? Feedback { get; set; }
}

public class UpdateSubmissionStatusRequestDto
{
    [Required]
    public SubmissionStatus Status { get; set; }

    public string? Feedback { get; set; }
}

public class SubmissionResponseDto
{
    public Guid Id { get; set; }
    public Guid AssignmentId { get; set; }
    public string AssignmentTitle { get; set; } = string.Empty;
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public SubmissionStatus Status { get; set; }
    public decimal? Marks { get; set; }
    public string? Feedback { get; set; }
    public DateTime? GradedAt { get; set; }
    public string? GradedByTeacherName { get; set; }
}
