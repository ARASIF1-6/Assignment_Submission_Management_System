using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Modules.Subjects.DTOs;
using Assignment_Submission_Management_System_Backend.Shared.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Assignment_Submission_Management_System_Backend.Modules.Subjects.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubjectsController : ControllerBase
{
    private readonly ISubjectService _subjectService;

    public SubjectsController(ISubjectService subjectService)
    {
        _subjectService = subjectService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<SubjectResponseDto>>>> GetAll()
    {
        var result = await _subjectService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<SubjectResponseDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SubjectResponseDto>>> GetById(Guid id)
    {
        var result = await _subjectService.GetByIdAsync(id);
        return Ok(ApiResponse<SubjectResponseDto>.Ok(result));
    }

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<SubjectResponseDto>>> Create([FromBody] CreateSubjectRequestDto request)
    {
        var result = await _subjectService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<SubjectResponseDto>.Ok(result, "Subject created."));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<SubjectResponseDto>>> Update(Guid id, [FromBody] UpdateSubjectRequestDto request)
    {
        var result = await _subjectService.UpdateAsync(id, request);
        return Ok(ApiResponse<SubjectResponseDto>.Ok(result, "Subject updated."));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        await _subjectService.DeleteAsync(id);
        return Ok(ApiResponse<object>.Ok(new { }, "Subject deleted."));
    }
}
