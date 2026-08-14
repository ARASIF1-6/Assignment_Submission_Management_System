using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Entities;
using Assignment_Submission_Management_System_Backend.Core.Exceptions;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Infrastructure.Data;
using Assignment_Submission_Management_System_Backend.Modules.TeacherClassSubjects.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Assignment_Submission_Management_System_Backend.Modules.TeacherClassSubjects.Services;

public class TeacherClassSubjectService : ITeacherClassSubjectService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public TeacherClassSubjectService(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<IEnumerable<TeacherClassSubjectResponseDto>> GetAllAsync()
    {
        return await QueryWithIncludes().OrderBy(cs => cs.Class.Name).Select(cs => MapToDto(cs)).ToListAsync();
    }

    public async Task<TeacherClassSubjectResponseDto> GetByIdAsync(Guid id)
    {
        var entity = await QueryWithIncludes().FirstOrDefaultAsync(cs => cs.Id == id)
            ?? throw new NotFoundException("Teacher class-subject assignment not found.");
        return MapToDto(entity);
    }

    public async Task<TeacherClassSubjectResponseDto> AssignTeacherAsync(AssignTeacherRequestDto request)
    {
        var classExists = await _context.Classes.AnyAsync(c => c.Id == request.ClassId && c.IsActive);
        if (!classExists)
            throw new NotFoundException("Class not found or inactive.");

        var subjectExists = await _context.Subjects.AnyAsync(s => s.Id == request.SubjectId && s.IsActive);
        if (!subjectExists)
            throw new NotFoundException("Subject not found or inactive.");

        var teacher = await _userManager.FindByIdAsync(request.TeacherId.ToString())
            ?? throw new NotFoundException("Teacher not found.");

        if (!await _userManager.IsInRoleAsync(teacher, Roles.Teacher))
            throw new BadRequestException("User must have the Teacher role.");

        var exists = await _context.TeacherClassSubjects.AnyAsync(cs =>
            cs.ClassId == request.ClassId && cs.SubjectId == request.SubjectId);
        if (exists)
            throw new BadRequestException("This class-subject combination already has a teacher assigned.");

        var entity = new TeacherClassSubject
        {
            ClassId = request.ClassId,
            SubjectId = request.SubjectId,
            TeacherId = request.TeacherId
        };

        _context.TeacherClassSubjects.Add(entity);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(entity.Id);
    }

    public async Task DeleteAsync(Guid id)
    {
        var entity = await _context.TeacherClassSubjects.FindAsync(id)
            ?? throw new NotFoundException("Teacher class-subject assignment not found.");

        _context.TeacherClassSubjects.Remove(entity);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<TeacherClassSubjectResponseDto>> GetByTeacherIdAsync(Guid teacherId)
    {
        return await QueryWithIncludes()
            .Where(cs => cs.TeacherId == teacherId)
            .Select(cs => MapToDto(cs))
            .ToListAsync();
    }

    public async Task<IEnumerable<TeacherClassSubjectResponseDto>> GetByClassIdAsync(Guid classId)
    {
        return await QueryWithIncludes()
            .Where(cs => cs.ClassId == classId)
            .Select(cs => MapToDto(cs))
            .ToListAsync();
    }

    private IQueryable<TeacherClassSubject> QueryWithIncludes() =>
        _context.TeacherClassSubjects
            .Include(cs => cs.Class)
            .Include(cs => cs.Subject)
            .Include(cs => cs.Teacher);

    private static TeacherClassSubjectResponseDto MapToDto(TeacherClassSubject cs) => new()
    {
        Id = cs.Id,
        ClassId = cs.ClassId,
        ClassName = cs.Class.Name,
        SubjectId = cs.SubjectId,
        SubjectName = cs.Subject.Name,
        TeacherId = cs.TeacherId,
        TeacherName = $"{cs.Teacher.FirstName} {cs.Teacher.LastName}",
        CreatedAt = cs.CreatedAt
    };
}
