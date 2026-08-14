using Microsoft.AspNetCore.Identity;

namespace Assignment_Submission_Management_System_Backend.Core.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<TeacherClassSubject> TeachingAssignments { get; set; } = [];
    public ICollection<StudentEnrollment> Enrollments { get; set; } = [];
    public ICollection<Assignment> CreatedAssignments { get; set; } = [];
    public ICollection<Submission> Submissions { get; set; } = [];
    public ICollection<Submission> GradedSubmissions { get; set; } = [];
}
