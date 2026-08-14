using Assignment_Submission_Management_System_Backend.Core.Common;

namespace Assignment_Submission_Management_System_Backend.Core.Entities;

public class TeacherClassSubject : BaseEntity
{
    public Guid ClassId { get; set; }
    public Guid SubjectId { get; set; }
    public Guid TeacherId { get; set; }

    public Class Class { get; set; } = null!;
    public Subject Subject { get; set; } = null!;
    public ApplicationUser Teacher { get; set; } = null!;
    public ICollection<Assignment> Assignments { get; set; } = [];
}
