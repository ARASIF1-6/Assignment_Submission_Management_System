using Assignment_Submission_Management_System_Backend.Core.Common;

namespace Assignment_Submission_Management_System_Backend.Core.Entities;

public class StudentEnrollment : BaseEntity
{
    public Guid StudentId { get; set; }
    public Guid ClassId { get; set; }
    public bool IsActive { get; set; } = true;

    public ApplicationUser Student { get; set; } = null!;
    public Class Class { get; set; } = null!;
}
