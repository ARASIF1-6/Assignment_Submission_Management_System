using Assignment_Submission_Management_System_Backend.Core.Common;

namespace Assignment_Submission_Management_System_Backend.Core.Entities;

public class AppSetting : BaseEntity
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
}
