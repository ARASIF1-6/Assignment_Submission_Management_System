using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Entities;
using Assignment_Submission_Management_System_Backend.Core.Enums;
using Assignment_Submission_Management_System_Backend.Core.Exceptions;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Infrastructure.Data;
using Assignment_Submission_Management_System_Backend.Modules.Submissions.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Assignment_Submission_Management_System_Backend.Modules.Submissions.Services;

public class SubmissionService : ISubmissionService
{
    private readonly ApplicationDbContext _context;

    public SubmissionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SubmissionResponseDto>> GetAllAsync(Guid? userId, string? role, Guid? assignmentId)
    {
        var query = QueryWithIncludes();

        if (assignmentId.HasValue)
            query = query.Where(s => s.AssignmentId == assignmentId);

        if (role == Roles.Student && userId.HasValue)
            query = query.Where(s => s.StudentId == userId);
        else if (role == Roles.Teacher && userId.HasValue)
            query = query.Where(s => s.Assignment.TeacherClassSubject.TeacherId == userId);

        return await query
            .OrderByDescending(s => s.SubmittedAt)
            .Select(s => MapToDto(s))
            .ToListAsync();
    }

    public async Task<SubmissionResponseDto> GetByIdAsync(Guid id, Guid? userId, string? role)
    {
        var submission = await QueryWithIncludes().FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new NotFoundException("Submission not found.");

        if (role == Roles.Student && submission.StudentId != userId)
            throw new ForbiddenException("You can only view your own submissions.");

        if (role == Roles.Teacher && submission.Assignment.TeacherClassSubject.TeacherId != userId)
            throw new ForbiddenException("You can only view submissions for your assignments.");

        return MapToDto(submission);
    }

    public async Task<SubmissionResponseDto> SubmitAsync(CreateSubmissionRequestDto request, Guid studentId)
    {
        var assignment = await _context.Assignments
            .Include(a => a.TeacherClassSubject)
            .FirstOrDefaultAsync(a => a.Id == request.AssignmentId)
            ?? throw new NotFoundException("Assignment not found.");

        if (assignment.Status != AssignmentStatus.Published)
            throw new BadRequestException("Assignment is not published.");

        var isEnrolled = await _context.StudentEnrollments.AnyAsync(e =>
            e.StudentId == studentId &&
            e.ClassId == assignment.TeacherClassSubject.ClassId &&
            e.IsActive);

        if (!isEnrolled)
            throw new ForbiddenException("You are not enrolled in this class.");

        var existing = await _context.Submissions
            .FirstOrDefaultAsync(s => s.AssignmentId == request.AssignmentId && s.StudentId == studentId);

        if (existing is not null)
            throw new BadRequestException("Submission already exists. Use update endpoint to modify your answer.");

        var isLate = DateTime.UtcNow > assignment.Deadline;
        var allowLate = await GetAllowLateSubmissionsAsync();

        if (isLate && !allowLate)
            throw new BadRequestException("Submission deadline has passed.");

        var submission = new Submission
        {
            AssignmentId = request.AssignmentId,
            StudentId = studentId,
            Answer = request.Answer,
            Status = isLate ? SubmissionStatus.Late : SubmissionStatus.Submitted
        };

        _context.Submissions.Add(submission);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(submission.Id, studentId, Roles.Student);
    }

    public async Task<SubmissionResponseDto> UpdateAsync(Guid id, UpdateSubmissionRequestDto request, Guid studentId)
    {
        var submission = await QueryWithIncludes().FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new NotFoundException("Submission not found.");

        if (submission.StudentId != studentId)
            throw new ForbiddenException("You can only update your own submissions.");

        var assignment = submission.Assignment;

        if (!assignment.AllowResubmission)
            throw new BadRequestException("Resubmission is not allowed for this assignment.");

        var isLate = DateTime.UtcNow > assignment.Deadline;
        var allowLate = await GetAllowLateSubmissionsAsync();

        if (isLate && !allowLate)
            throw new BadRequestException("Submission deadline has passed.");

        submission.Answer = request.Answer;
        submission.SubmittedAt = DateTime.UtcNow;
        submission.UpdatedAt = DateTime.UtcNow;
        submission.Status = isLate ? SubmissionStatus.Late : SubmissionStatus.Submitted;
        submission.Marks = null;
        submission.Feedback = null;
        submission.GradedAt = null;
        submission.GradedByTeacherId = null;

        await _context.SaveChangesAsync();
        return MapToDto(submission);
    }

    public async Task<SubmissionResponseDto> GradeAsync(Guid id, GradeSubmissionRequestDto request, Guid teacherId, string role)
    {
        var submission = await QueryWithIncludes().FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new NotFoundException("Submission not found.");

        EnsureCanGrade(submission, teacherId, role);

        if (request.Marks > submission.Assignment.MaxMarks)
            throw new BadRequestException($"Marks cannot exceed maximum marks ({submission.Assignment.MaxMarks}).");

        submission.Marks = request.Marks;
        submission.Feedback = request.Feedback;
        submission.Status = SubmissionStatus.Graded;
        submission.GradedAt = DateTime.UtcNow;
        submission.GradedByTeacherId = teacherId;
        submission.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(submission);
    }

    public async Task<SubmissionResponseDto> UpdateStatusAsync(Guid id, UpdateSubmissionStatusRequestDto request, Guid teacherId, string role)
    {
        var submission = await QueryWithIncludes().FirstOrDefaultAsync(s => s.Id == id)
            ?? throw new NotFoundException("Submission not found.");

        EnsureCanGrade(submission, teacherId, role);

        submission.Status = request.Status;
        if (!string.IsNullOrWhiteSpace(request.Feedback))
            submission.Feedback = request.Feedback;
        submission.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(submission);
    }

    private static void EnsureCanGrade(Submission submission, Guid teacherId, string role)
    {
        if (role != Roles.Admin && submission.Assignment.TeacherClassSubject.TeacherId != teacherId)
            throw new ForbiddenException("You can only grade submissions for your assignments.");
    }

    private async Task<bool> GetAllowLateSubmissionsAsync()
    {
        var setting = await _context.AppSettings.FirstOrDefaultAsync(s => s.Key == "AllowLateSubmissions");
        return setting is not null && bool.TryParse(setting.Value, out var allow) && allow;
    }

    private IQueryable<Submission> QueryWithIncludes() =>
        _context.Submissions
            .Include(s => s.Assignment).ThenInclude(a => a.TeacherClassSubject)
            .Include(s => s.Student)
            .Include(s => s.GradedByTeacher);

    private static SubmissionResponseDto MapToDto(Submission s) => new()
    {
        Id = s.Id,
        AssignmentId = s.AssignmentId,
        AssignmentTitle = s.Assignment.Title,
        StudentId = s.StudentId,
        StudentName = $"{s.Student.FirstName} {s.Student.LastName}",
        Answer = s.Answer,
        SubmittedAt = s.SubmittedAt,
        UpdatedAt = s.UpdatedAt,
        Status = s.Status,
        Marks = s.Marks,
        Feedback = s.Feedback,
        GradedAt = s.GradedAt,
        GradedByTeacherName = s.GradedByTeacher is not null
            ? $"{s.GradedByTeacher.FirstName} {s.GradedByTeacher.LastName}"
            : null
    };
}
