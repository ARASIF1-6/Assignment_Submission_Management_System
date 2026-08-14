using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Modules.TeacherClassSubjects.DTOs;
using Assignment_Submission_Management_System_Backend.Shared.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Assignment_Submission_Management_System_Backend.Modules.TeacherClassSubjects.Controllers;

[ApiController]
[Route("api/teacher-class-subjects")]
[Authorize]
public class TeacherClassSubjectsController : ControllerBase
{
    private readonly ITeacherClassSubjectService _teacherClassSubjectService;

    public TeacherClassSubjectsController(ITeacherClassSubjectService teacherClassSubjectService)
    {
        _teacherClassSubjectService = teacherClassSubjectService;
    }

    [HttpGet]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Teacher}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<TeacherClassSubjectResponseDto>>>> GetAll()
    {
        var result = await _teacherClassSubjectService.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<TeacherClassSubjectResponseDto>>.Ok(result));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TeacherClassSubjectResponseDto>>> GetById(Guid id)
    {
        var result = await _teacherClassSubjectService.GetByIdAsync(id);
        return Ok(ApiResponse<TeacherClassSubjectResponseDto>.Ok(result));
    }

    [HttpGet("by-teacher/{teacherId:guid}")]
    [Authorize(Roles = $"{Roles.Admin},{Roles.Teacher}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<TeacherClassSubjectResponseDto>>>> GetByTeacher(Guid teacherId)
    {
        var result = await _teacherClassSubjectService.GetByTeacherIdAsync(teacherId);
        return Ok(ApiResponse<IEnumerable<TeacherClassSubjectResponseDto>>.Ok(result));
    }

    [HttpGet("by-class/{classId:guid}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<TeacherClassSubjectResponseDto>>>> GetByClass(Guid classId)
    {
        var result = await _teacherClassSubjectService.GetByClassIdAsync(classId);
        return Ok(ApiResponse<IEnumerable<TeacherClassSubjectResponseDto>>.Ok(result));
    }

    [HttpPost]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<TeacherClassSubjectResponseDto>>> AssignTeacher([FromBody] AssignTeacherRequestDto request)
    {
        var result = await _teacherClassSubjectService.AssignTeacherAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, ApiResponse<TeacherClassSubjectResponseDto>.Ok(result, "Teacher assigned."));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        await _teacherClassSubjectService.DeleteAsync(id);
        return Ok(ApiResponse<object>.Ok(new { }, "Assignment removed."));
    }
}
