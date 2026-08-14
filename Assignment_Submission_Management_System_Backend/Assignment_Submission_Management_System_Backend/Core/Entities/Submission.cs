using Assignment_Submission_Management_System_Backend.Core.Common;
using Assignment_Submission_Management_System_Backend.Core.Enums;

namespace Assignment_Submission_Management_System_Backend.Core.Entities;

public class Submission : BaseEntity
{
    public Guid AssignmentId { get; set; }
    public Guid StudentId { get; set; }
    public string Answer { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Submitted;
    public decimal? Marks { get; set; }
    public string? Feedback { get; set; }
    public DateTime? GradedAt { get; set; }
    public Guid? GradedByTeacherId { get; set; }

    public Assignment Assignment { get; set; } = null!;
    public ApplicationUser Student { get; set; } = null!;
    public ApplicationUser? GradedByTeacher { get; set; }
}
