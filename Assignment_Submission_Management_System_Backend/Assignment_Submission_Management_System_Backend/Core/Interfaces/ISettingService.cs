using Assignment_Submission_Management_System_Backend.Modules.Settings.DTOs;

namespace Assignment_Submission_Management_System_Backend.Core.Interfaces;

public interface ISettingService
{
    Task<IEnumerable<SettingResponseDto>> GetAllAsync();
    Task<SettingResponseDto> GetByKeyAsync(string key);
    Task<SettingResponseDto> UpsertAsync(UpsertSettingRequestDto request);
    Task DeleteAsync(Guid id);
}
