using Assignment_Submission_Management_System_Backend.Core.Common;

namespace Assignment_Submission_Management_System_Backend.Core.Entities;

public class Class : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string AcademicYear { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<TeacherClassSubject> TeacherClassSubjects { get; set; } = [];
    public ICollection<StudentEnrollment> Enrollments { get; set; } = [];
}
