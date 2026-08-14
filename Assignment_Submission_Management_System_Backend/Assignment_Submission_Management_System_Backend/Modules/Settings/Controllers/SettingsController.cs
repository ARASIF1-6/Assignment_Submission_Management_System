using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Modules.Settings.DTOs;
using Assignment_Submission_Management_System_Backend.Shared.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Assignment_Submission_Management_System_Backend.Modules.Settings.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin)]
public class SettingsController : ControllerBase
{
    private readonly ISettingService _settingService;

    public SettingsController(ISettingService settingService)
    {
        _settingService = settingService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<SettingResponseDto>>>> GetAll()
    {
        var result = await _settingService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<SettingResponseDto>>.Ok(result));
    }

    [HttpGet("{key}")]
    public async Task<ActionResult<ApiResponse<SettingResponseDto>>> GetByKey(string key)
    {
        var result = await _settingService.GetByKeyAsync(key);
        return Ok(ApiResponse<SettingResponseDto>.Ok(result));
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<SettingResponseDto>>> Upsert([FromBody] UpsertSettingRequestDto request)
    {
        var result = await _settingService.UpsertAsync(request);
        return Ok(ApiResponse<SettingResponseDto>.Ok(result, "Setting saved."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        await _settingService.DeleteAsync(id);
        return Ok(ApiResponse<object>.Ok(new { }, "Setting deleted."));
    }
}
