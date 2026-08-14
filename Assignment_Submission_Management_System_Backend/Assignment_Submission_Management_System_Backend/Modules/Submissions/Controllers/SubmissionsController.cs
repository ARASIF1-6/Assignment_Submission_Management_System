using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Modules.Submissions.DTOs;
using Assignment_Submission_Management_System_Backend.Shared.DTOs;
using Assignment_Submission_Management_System_Backend.Shared.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Assignment_Submission_Management_System_Backend.Modules.Submissions.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubmissionsController : ControllerBase
{
    private readonly ISubmissionService _submissionService;

    public SubmissionsController(ISubmissionService submissionService)
    {
        _submissionService = submissionService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<SubmissionResponseDto>>>> GetAll([FromQuery] Guid? assignmentId)
    {
        var userId = User.GetUserId();
        var role = User.GetPrimaryRole();
        var result = await _submissionService.GetAllAsync(userId, role, assignmentId);
        return Ok(ApiResponse<IEnumerable<SubmissionResponseDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SubmissionResponseDto>>> GetById(Guid id)
    {
        var userId = User.GetUserId();
        var role = User.GetPrimaryRole();
        var result = await _submissionService.GetByIdAsync(id, userId, role);
        return Ok(ApiResponse<SubmissionResponseDto>.Ok(result));
    }

    [HttpPost]
    [Authorize(Roles = Roles.Student)]
    public async Task<ActionResult<ApiResponse<SubmissionResponseDto>>> Submit([FromBody] CreateSubmissionRequestDto request)
    {
        var result = await _submissionService.SubmitAsync(request, User.GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<SubmissionResponseDto>.Ok(result, "Submission created."));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.Student)]
    public async Task<ActionResult<ApiResponse<SubmissionResponseDto>>> Update(Guid id, [FromBody] UpdateSubmissionRequestDto request)
    {
        var result = await _submissionService.UpdateAsync(id, request, User.GetUserId());
        return Ok(ApiResponse<SubmissionResponseDto>.Ok(result, "Submission updated."));
    }

    [HttpPatch("{id:guid}/grade")]
    [Authorize(Roles = $"{Roles.Teacher},{Roles.Admin}")]
    public async Task<ActionResult<ApiResponse<SubmissionResponseDto>>> Grade(Guid id, [FromBody] GradeSubmissionRequestDto request)
    {
        var result = await _submissionService.GradeAsync(id, request, User.GetUserId(), User.GetPrimaryRole()!);
        return Ok(ApiResponse<SubmissionResponseDto>.Ok(result, "Submission graded."));
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = $"{Roles.Teacher},{Roles.Admin}")]
    public async Task<ActionResult<ApiResponse<SubmissionResponseDto>>> UpdateStatus(Guid id, [FromBody] UpdateSubmissionStatusRequestDto request)
    {
        var result = await _submissionService.UpdateStatusAsync(id, request, User.GetUserId(), User.GetPrimaryRole()!);
        return Ok(ApiResponse<SubmissionResponseDto>.Ok(result, "Submission status updated."));
    }
}
