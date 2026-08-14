using System.ComponentModel.DataAnnotations;

namespace Assignment_Submission_Management_System_Backend.Modules.Settings.DTOs;

public class UpsertSettingRequestDto
{
    [Required, MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    [Required, MaxLength(1000)]
    public string Value { get; set; } = string.Empty;

    public string? Description { get; set; }
}

public class SettingResponseDto
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
