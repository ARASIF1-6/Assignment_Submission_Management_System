using Assignment_Submission_Management_System_Backend.Core.Common;
using Assignment_Submission_Management_System_Backend.Core.Enums;

namespace Assignment_Submission_Management_System_Backend.Core.Entities;

public class Assignment : BaseEntity
{
    public Guid TeacherClassSubjectId { get; set; }
    public Guid CreatedByTeacherId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public decimal MaxMarks { get; set; }
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;
    public bool AllowResubmission { get; set; } = true;

    public TeacherClassSubject TeacherClassSubject { get; set; } = null!;
    public ApplicationUser CreatedByTeacher { get; set; } = null!;
    public ICollection<Submission> Submissions { get; set; } = [];
}
