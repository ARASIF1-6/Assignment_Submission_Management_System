using Assignment_Submission_Management_System_Backend.Core.Entities;
using Assignment_Submission_Management_System_Backend.Core.Exceptions;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Infrastructure.Data;
using Assignment_Submission_Management_System_Backend.Modules.Settings.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Assignment_Submission_Management_System_Backend.Modules.Settings.Services;

public class SettingService : ISettingService
{
    private readonly ApplicationDbContext _context;

    public SettingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SettingResponseDto>> GetAllAsync()
    {
        return await _context.AppSettings
            .OrderBy(s => s.Key)
            .Select(s => MapToDto(s))
            .ToListAsync();
    }

    public async Task<SettingResponseDto> GetByKeyAsync(string key)
    {
        var setting = await _context.AppSettings.FirstOrDefaultAsync(s => s.Key == key)
            ?? throw new NotFoundException($"Setting '{key}' not found.");
        return MapToDto(setting);
    }

    public async Task<SettingResponseDto> UpsertAsync(UpsertSettingRequestDto request)
    {
        var setting = await _context.AppSettings.FirstOrDefaultAsync(s => s.Key == request.Key);

        if (setting is null)
        {
            setting = new AppSetting
            {
                Key = request.Key,
                Value = request.Value,
                Description = request.Description
            };
            _context.AppSettings.Add(setting);
        }
        else
        {
            setting.Value = request.Value;
            setting.Description = request.Description ?? setting.Description;
            setting.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return MapToDto(setting);
    }

    public async Task DeleteAsync(Guid id)
    {
        var setting = await _context.AppSettings.FindAsync(id)
            ?? throw new NotFoundException("Setting not found.");

        _context.AppSettings.Remove(setting);
        await _context.SaveChangesAsync();
    }

    private static SettingResponseDto MapToDto(AppSetting s) => new()
    {
        Id = s.Id,
        Key = s.Key,
        Value = s.Value,
        Description = s.Description,
        CreatedAt = s.CreatedAt,
        UpdatedAt = s.UpdatedAt
    };
}
