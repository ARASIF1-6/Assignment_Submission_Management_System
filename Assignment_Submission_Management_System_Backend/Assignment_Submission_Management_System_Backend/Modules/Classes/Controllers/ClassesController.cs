using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Modules.Classes.DTOs;
using Assignment_Submission_Management_System_Backend.Shared.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Assignment_Submission_Management_System_Backend.Modules.Classes.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClassesController : ControllerBase
{
    private readonly IClassService _classService;

    public ClassesController(IClassService classService)
    {
        _classService = classService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<ClassResponseDto>>>> GetAll()
    {
        var result = await _classService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<ClassResponseDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<ClassResponseDto>>> GetById(Guid id)
    {
        var result = await _classService.GetByIdAsync(id);
        return Ok(ApiResponse<ClassResponseDto>.Ok(result));
    }

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<ClassResponseDto>>> Create([FromBody] CreateClassRequestDto request)
    {
        var result = await _classService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<ClassResponseDto>.Ok(result, "Class created."));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<ClassResponseDto>>> Update(Guid id, [FromBody] UpdateClassRequestDto request)
    {
        var result = await _classService.UpdateAsync(id, request);
        return Ok(ApiResponse<ClassResponseDto>.Ok(result, "Class updated."));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        await _classService.DeleteAsync(id);
        return Ok(ApiResponse<object>.Ok(new { }, "Class deleted."));
    }
}
