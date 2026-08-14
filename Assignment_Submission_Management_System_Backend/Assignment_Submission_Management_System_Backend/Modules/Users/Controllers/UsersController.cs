using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Modules.Users.DTOs;
using Assignment_Submission_Management_System_Backend.Shared.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Assignment_Submission_Management_System_Backend.Modules.Users.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<IEnumerable<UserResponseDto>>>> GetAll()
    {
        var result = await _userService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<UserResponseDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> GetById(Guid id)
    {
        var result = await _userService.GetByIdAsync(id);
        return Ok(ApiResponse<UserResponseDto>.Ok(result));
    }

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> Create([FromBody] CreateUserRequestDto request)
    {
        var result = await _userService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<UserResponseDto>.Ok(result, "User created."));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<UserResponseDto>>> Update(Guid id, [FromBody] UpdateUserRequestDto request)
    {
        var result = await _userService.UpdateAsync(id, request);
        return Ok(ApiResponse<UserResponseDto>.Ok(result, "User updated."));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        await _userService.DeleteAsync(id);
        return Ok(ApiResponse<object>.Ok(new { }, "User deleted."));
    }

    [HttpPost("enroll")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<object>>> EnrollStudent([FromBody] EnrollStudentRequestDto request)
    {
        await _userService.EnrollStudentAsync(request);
        return Ok(ApiResponse<object>.Ok(new { }, "Student enrolled successfully."));
    }

    [HttpDelete("enrollments/{enrollmentId:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<object>>> RemoveEnrollment(Guid enrollmentId)
    {
        await _userService.RemoveEnrollmentAsync(enrollmentId);
        return Ok(ApiResponse<object>.Ok(new { }, "Enrollment removed."));
    }

    [HttpGet("{studentId:guid}/enrollments")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Student}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<EnrollmentResponseDto>>>> GetEnrollments(Guid studentId)
    {
        var result = await _userService.GetStudentEnrollmentsAsync(studentId);
        return Ok(ApiResponse<IEnumerable<EnrollmentResponseDto>>.Ok(result));
    }
}
