using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Modules.Assignments.DTOs;
using Assignment_Submission_Management_System_Backend.Shared.DTOs;
using Assignment_Submission_Management_System_Backend.Shared.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Assignment_Submission_Management_System_Backend.Modules.Assignments.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;

    public AssignmentsController(IAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<AssignmentResponseDto>>>> GetAll()
    {
        var userId = User.GetUserId();
        var role = User.GetPrimaryRole();
        var result = await _assignmentService.GetAllAsync(userId, role);
        return Ok(ApiResponse<IEnumerable<AssignmentResponseDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<AssignmentResponseDto>>> GetById(Guid id)
    {
        var userId = User.GetUserId();
        var role = User.GetPrimaryRole();
        var result = await _assignmentService.GetByIdAsync(id, userId, role);
        return Ok(ApiResponse<AssignmentResponseDto>.Ok(result));
    }

    [HttpPost]
    [Authorize(Roles = Roles.Teacher)]
    public async Task<ActionResult<ApiResponse<AssignmentResponseDto>>> Create([FromBody] CreateAssignmentRequestDto request)
    {
        var result = await _assignmentService.CreateAsync(request, User.GetUserId());
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<AssignmentResponseDto>.Ok(result, "Assignment created."));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = $"{Roles.Teacher},{Roles.Admin}")]
    public async Task<ActionResult<ApiResponse<AssignmentResponseDto>>> Update(Guid id, [FromBody] UpdateAssignmentRequestDto request)
    {
        var result = await _assignmentService.UpdateAsync(id, request, User.GetUserId(), User.GetPrimaryRole()!);
        return Ok(ApiResponse<AssignmentResponseDto>.Ok(result, "Assignment updated."));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = $"{Roles.Teacher},{Roles.Admin}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        await _assignmentService.DeleteAsync(id, User.GetUserId(), User.GetPrimaryRole()!);
        return Ok(ApiResponse<object>.Ok(new { }, "Assignment deleted."));
    }

    [HttpPatch("{id:guid}/publish")]
    [Authorize(Roles = $"{Roles.Teacher},{Roles.Admin}")]
    public async Task<ActionResult<ApiResponse<AssignmentResponseDto>>> Publish(Guid id)
    {
        var result = await _assignmentService.PublishAsync(id, User.GetUserId(), User.GetPrimaryRole()!);
        return Ok(ApiResponse<AssignmentResponseDto>.Ok(result, "Assignment published."));
    }
}
