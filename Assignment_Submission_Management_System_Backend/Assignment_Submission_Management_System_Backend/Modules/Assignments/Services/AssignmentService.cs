using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Entities;
using Assignment_Submission_Management_System_Backend.Core.Enums;
using Assignment_Submission_Management_System_Backend.Core.Exceptions;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Infrastructure.Data;
using Assignment_Submission_Management_System_Backend.Modules.Assignments.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Assignment_Submission_Management_System_Backend.Modules.Assignments.Services;

public class AssignmentService : IAssignmentService
{
    private readonly ApplicationDbContext _context;

    public AssignmentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AssignmentResponseDto>> GetAllAsync(Guid? userId, string? role)
    {
        var query = QueryWithIncludes();

        if (role == Roles.Student && userId.HasValue)
        {
            var classIds = await _context.StudentEnrollments
                .Where(e => e.StudentId == userId && e.IsActive)
                .Select(e => e.ClassId)
                .ToListAsync();

            query = query.Where(a =>
                a.Status == AssignmentStatus.Published &&
                classIds.Contains(a.TeacherClassSubject.ClassId));
        }
        else if (role == Roles.Teacher && userId.HasValue)
        {
            query = query.Where(a => a.TeacherClassSubject.TeacherId == userId);
        }

        return await query
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => MapToDto(a))
            .ToListAsync();
    }

    public async Task<AssignmentResponseDto> GetByIdAsync(Guid id, Guid? userId, string? role)
    {
        var assignment = await QueryWithIncludes().FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new NotFoundException("Assignment not found.");

        if (role == Roles.Student)
        {
            if (assignment.Status != AssignmentStatus.Published)
                throw new ForbiddenException("Assignment is not published.");

            var isEnrolled = await _context.StudentEnrollments.AnyAsync(e =>
                e.StudentId == userId &&
                e.ClassId == assignment.TeacherClassSubject.ClassId &&
                e.IsActive);

            if (!isEnrolled)
                throw new ForbiddenException("You are not enrolled in this class.");
        }
        else if (role == Roles.Teacher && assignment.TeacherClassSubject.TeacherId != userId)
        {
            throw new ForbiddenException("You can only view assignments you are responsible for.");
        }

        return MapToDto(assignment);
    }

    public async Task<AssignmentResponseDto> CreateAsync(CreateAssignmentRequestDto request, Guid teacherId)
    {
        var teacherClassSubject = await _context.TeacherClassSubjects
            .Include(cs => cs.Class)
            .Include(cs => cs.Subject)
            .Include(cs => cs.Teacher)
            .FirstOrDefaultAsync(cs => cs.Id == request.TeacherClassSubjectId)
            ?? throw new NotFoundException("Teacher class-subject assignment not found.");

        if (teacherClassSubject.TeacherId != teacherId)
            throw new ForbiddenException("You can only create assignments for your assigned class-subjects.");

        if (request.Deadline <= DateTime.UtcNow)
            throw new BadRequestException("Deadline must be in the future.");

        var assignment = new Assignment
        {
            TeacherClassSubjectId = request.TeacherClassSubjectId,
            CreatedByTeacherId = teacherId,
            Title = request.Title,
            Description = request.Description,
            Deadline = request.Deadline.ToUniversalTime(),
            MaxMarks = request.MaxMarks,
            AllowResubmission = request.AllowResubmission,
            Status = AssignmentStatus.Draft
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        assignment.TeacherClassSubject = teacherClassSubject;
        assignment.CreatedByTeacher = teacherClassSubject.Teacher;
        return MapToDto(assignment);
    }

    public async Task<AssignmentResponseDto> UpdateAsync(Guid id, UpdateAssignmentRequestDto request, Guid teacherId, string role)
    {
        var assignment = await QueryWithIncludes().FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new NotFoundException("Assignment not found.");

        EnsureCanModify(assignment, teacherId, role);

        if (request.Deadline <= DateTime.UtcNow)
            throw new BadRequestException("Deadline must be in the future.");

        assignment.Title = request.Title;
        assignment.Description = request.Description;
        assignment.Deadline = request.Deadline.ToUniversalTime();
        assignment.MaxMarks = request.MaxMarks;
        assignment.AllowResubmission = request.AllowResubmission;
        assignment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(assignment);
    }

    public async Task DeleteAsync(Guid id, Guid teacherId, string role)
    {
        var assignment = await QueryWithIncludes().FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new NotFoundException("Assignment not found.");

        EnsureCanModify(assignment, teacherId, role);

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();
    }

    public async Task<AssignmentResponseDto> PublishAsync(Guid id, Guid teacherId, string role)
    {
        var assignment = await QueryWithIncludes().FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new NotFoundException("Assignment not found.");

        EnsureCanModify(assignment, teacherId, role);

        assignment.Status = AssignmentStatus.Published;
        assignment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return MapToDto(assignment);
    }

    private static void EnsureCanModify(Assignment assignment, Guid teacherId, string role)
    {
        if (role != Roles.Admin && assignment.TeacherClassSubject.TeacherId != teacherId)
            throw new ForbiddenException("You can only modify your own assignments.");
    }

    private IQueryable<Assignment> QueryWithIncludes() =>
        _context.Assignments
            .Include(a => a.TeacherClassSubject).ThenInclude(cs => cs.Class)
            .Include(a => a.TeacherClassSubject).ThenInclude(cs => cs.Subject)
            .Include(a => a.CreatedByTeacher);

    private static AssignmentResponseDto MapToDto(Assignment a) => new()
    {
        Id = a.Id,
        TeacherClassSubjectId = a.TeacherClassSubjectId,
        ClassName = a.TeacherClassSubject.Class.Name,
        SubjectName = a.TeacherClassSubject.Subject.Name,
        Title = a.Title,
        Description = a.Description,
        Deadline = a.Deadline,
        MaxMarks = a.MaxMarks,
        Status = a.Status,
        AllowResubmission = a.AllowResubmission,
        CreatedByTeacherName = $"{a.CreatedByTeacher.FirstName} {a.CreatedByTeacher.LastName}",
        CreatedAt = a.CreatedAt,
        UpdatedAt = a.UpdatedAt
    };
}
