using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Entities;
using Assignment_Submission_Management_System_Backend.Core.Enums;
using Assignment_Submission_Management_System_Backend.Core.Exceptions;
using Assignment_Submission_Management_System_Backend.Infrastructure.Data;
using Assignment_Submission_Management_System_Backend.Modules.Submissions.DTOs;
using Assignment_Submission_Management_System_Backend.Modules.Submissions.Services;
using Assignment_Submission_Management_System_Backend.Tests.Helpers;
using Xunit;

namespace Assignment_Submission_Management_System_Backend.Tests.Services;

public class SubmissionServiceTests
{
    [Fact]
    public async Task SubmitAsync_EnrolledStudent_SubmitsSuccessfully()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new SubmissionService(context);

        var (student, teacher, classObj, subject, tcs, assignment) = SeedBasicHierarchy(context);

        // Enroll student in class
        context.StudentEnrollments.Add(new StudentEnrollment
        {
            Id = Guid.NewGuid(),
            StudentId = student.Id,
            ClassId = classObj.Id,
            IsActive = true
        });
        await context.SaveChangesAsync();

        var request = new CreateSubmissionRequestDto
        {
            AssignmentId = assignment.Id,
            Answer = "My submission answer code solution."
        };

        // Act
        var result = await service.SubmitAsync(request, student.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(assignment.Id, result.AssignmentId);
        Assert.Equal(student.Id, result.StudentId);
        Assert.Equal("My submission answer code solution.", result.Answer);
        Assert.Equal(SubmissionStatus.Submitted, result.Status);
    }

    [Fact]
    public async Task SubmitAsync_UnenrolledStudent_ThrowsForbiddenException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new SubmissionService(context);

        var (student, teacher, classObj, subject, tcs, assignment) = SeedBasicHierarchy(context);

        var request = new CreateSubmissionRequestDto
        {
            AssignmentId = assignment.Id,
            Answer = "My answer"
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ForbiddenException>(() => service.SubmitAsync(request, student.Id));
        Assert.Contains("not enrolled", ex.Message);
    }

    [Fact]
    public async Task SubmitAsync_UnpublishedAssignment_ThrowsBadRequestException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new SubmissionService(context);

        var (student, teacher, classObj, subject, tcs, assignment) = SeedBasicHierarchy(context);

        // Set assignment status to Draft
        assignment.Status = AssignmentStatus.Draft;
        await context.SaveChangesAsync();

        var request = new CreateSubmissionRequestDto
        {
            AssignmentId = assignment.Id,
            Answer = "My answer"
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.SubmitAsync(request, student.Id));
        Assert.Contains("not published", ex.Message);
    }

    [Fact]
    public async Task SubmitAsync_DuplicateSubmission_ThrowsBadRequestException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new SubmissionService(context);

        var (student, teacher, classObj, subject, tcs, assignment) = SeedBasicHierarchy(context);

        context.StudentEnrollments.Add(new StudentEnrollment
        {
            Id = Guid.NewGuid(),
            StudentId = student.Id,
            ClassId = classObj.Id,
            IsActive = true
        });

        // Add initial submission
        context.Submissions.Add(new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            StudentId = student.Id,
            Answer = "First submission",
            Status = SubmissionStatus.Submitted
        });
        await context.SaveChangesAsync();

        var request = new CreateSubmissionRequestDto
        {
            AssignmentId = assignment.Id,
            Answer = "Second submission attempt"
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.SubmitAsync(request, student.Id));
        Assert.Contains("already exists", ex.Message);
    }

    [Fact]
    public async Task SubmitAsync_PastDeadlineLateSubmissionsAllowed_SubmitsAsLate()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new SubmissionService(context);

        var (student, teacher, classObj, subject, tcs, assignment) = SeedBasicHierarchy(context);
        
        // Expired deadline
        assignment.Deadline = DateTime.UtcNow.AddHours(-2);

        // Global late submission setting = true
        context.AppSettings.Add(new AppSetting { Key = "AllowLateSubmissions", Value = "true" });
        context.StudentEnrollments.Add(new StudentEnrollment
        {
            Id = Guid.NewGuid(),
            StudentId = student.Id,
            ClassId = classObj.Id,
            IsActive = true
        });
        await context.SaveChangesAsync();

        var request = new CreateSubmissionRequestDto
        {
            AssignmentId = assignment.Id,
            Answer = "Late submission answer"
        };

        // Act
        var result = await service.SubmitAsync(request, student.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(SubmissionStatus.Late, result.Status);
    }

    [Fact]
    public async Task SubmitAsync_PastDeadlineLateSubmissionsDisallowed_ThrowsBadRequestException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new SubmissionService(context);

        var (student, teacher, classObj, subject, tcs, assignment) = SeedBasicHierarchy(context);

        assignment.Deadline = DateTime.UtcNow.AddHours(-2);
        context.AppSettings.Add(new AppSetting { Key = "AllowLateSubmissions", Value = "false" });
        context.StudentEnrollments.Add(new StudentEnrollment
        {
            Id = Guid.NewGuid(),
            StudentId = student.Id,
            ClassId = classObj.Id,
            IsActive = true
        });
        await context.SaveChangesAsync();

        var request = new CreateSubmissionRequestDto
        {
            AssignmentId = assignment.Id,
            Answer = "Late submission answer"
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.SubmitAsync(request, student.Id));
        Assert.Contains("deadline has passed", ex.Message);
    }

    [Fact]
    public async Task UpdateAsync_ResubmissionAllowed_UpdatesSubmission()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new SubmissionService(context);

        var (student, teacher, classObj, subject, tcs, assignment) = SeedBasicHierarchy(context);
        assignment.AllowResubmission = true;

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            StudentId = student.Id,
            Answer = "Old answer text",
            Status = SubmissionStatus.Submitted,
            Assignment = assignment,
            Student = student
        };
        context.Submissions.Add(submission);
        await context.SaveChangesAsync();

        var updateRequest = new UpdateSubmissionRequestDto { Answer = "Updated refined answer text" };

        // Act
        var result = await service.UpdateAsync(submission.Id, updateRequest, student.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated refined answer text", result.Answer);
    }

    [Fact]
    public async Task UpdateAsync_ResubmissionNotAllowed_ThrowsBadRequestException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new SubmissionService(context);

        var (student, teacher, classObj, subject, tcs, assignment) = SeedBasicHierarchy(context);
        assignment.AllowResubmission = false;

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            StudentId = student.Id,
            Answer = "Original answer",
            Status = SubmissionStatus.Submitted,
            Assignment = assignment,
            Student = student
        };
        context.Submissions.Add(submission);
        await context.SaveChangesAsync();

        var updateRequest = new UpdateSubmissionRequestDto { Answer = "New answer attempt" };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.UpdateAsync(submission.Id, updateRequest, student.Id));
        Assert.Contains("Resubmission is not allowed", ex.Message);
    }

    [Fact]
    public async Task GradeAsync_ValidMarksByAssignedTeacher_GradesSuccessfully()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new SubmissionService(context);

        var (student, teacher, classObj, subject, tcs, assignment) = SeedBasicHierarchy(context);

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            StudentId = student.Id,
            Answer = "Student solution text",
            Status = SubmissionStatus.Submitted,
            Assignment = assignment,
            Student = student
        };
        context.Submissions.Add(submission);
        await context.SaveChangesAsync();

        var gradeRequest = new GradeSubmissionRequestDto
        {
            Marks = 95.5m,
            Feedback = "Excellent work on implementation!"
        };

        // Act
        var result = await service.GradeAsync(submission.Id, gradeRequest, teacher.Id, Roles.Teacher);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(95.5m, result.Marks);
        Assert.Equal("Excellent work on implementation!", result.Feedback);
        Assert.Equal(SubmissionStatus.Graded, result.Status);
    }

    [Fact]
    public async Task GradeAsync_MarksExceedMaxMarks_ThrowsBadRequestException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new SubmissionService(context);

        var (student, teacher, classObj, subject, tcs, assignment) = SeedBasicHierarchy(context);
        assignment.MaxMarks = 100;

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            StudentId = student.Id,
            Answer = "Solution",
            Status = SubmissionStatus.Submitted,
            Assignment = assignment,
            Student = student
        };
        context.Submissions.Add(submission);
        await context.SaveChangesAsync();

        var gradeRequest = new GradeSubmissionRequestDto { Marks = 105m, Feedback = "Over max marks" };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.GradeAsync(submission.Id, gradeRequest, teacher.Id, Roles.Teacher));
        Assert.Contains("cannot exceed maximum marks", ex.Message);
    }

    [Fact]
    public async Task GradeAsync_UnassignedTeacher_ThrowsForbiddenException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new SubmissionService(context);

        var (student, teacher, classObj, subject, tcs, assignment) = SeedBasicHierarchy(context);
        var otherTeacherId = Guid.NewGuid();

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            StudentId = student.Id,
            Answer = "Solution",
            Status = SubmissionStatus.Submitted,
            Assignment = assignment,
            Student = student
        };
        context.Submissions.Add(submission);
        await context.SaveChangesAsync();

        var gradeRequest = new GradeSubmissionRequestDto { Marks = 80m, Feedback = "Good" };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ForbiddenException>(() => service.GradeAsync(submission.Id, gradeRequest, otherTeacherId, Roles.Teacher));
        Assert.Contains("only grade submissions for your assignments", ex.Message);
    }

    [Fact]
    public async Task GradeAsync_AdminOverride_GradesSuccessfully()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new SubmissionService(context);

        var (student, teacher, classObj, subject, tcs, assignment) = SeedBasicHierarchy(context);
        var adminId = Guid.NewGuid();

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignment.Id,
            StudentId = student.Id,
            Answer = "Solution",
            Status = SubmissionStatus.Submitted,
            Assignment = assignment,
            Student = student
        };
        context.Submissions.Add(submission);
        await context.SaveChangesAsync();

        var gradeRequest = new GradeSubmissionRequestDto { Marks = 88m, Feedback = "Admin graded" };

        // Act
        var result = await service.GradeAsync(submission.Id, gradeRequest, adminId, Roles.Admin);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(88m, result.Marks);
        Assert.Equal(SubmissionStatus.Graded, result.Status);
    }

    private static (ApplicationUser student, ApplicationUser teacher, Class classObj, Subject subject, TeacherClassSubject tcs, Assignment assignment) SeedBasicHierarchy(ApplicationDbContext context)
    {
        var student = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "student@school.com",
            UserName = "student@school.com",
            FirstName = "John",
            LastName = "Doe",
            IsActive = true
        };

        var teacher = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "teacher@school.com",
            UserName = "teacher@school.com",
            FirstName = "Jane",
            LastName = "Smith",
            IsActive = true
        };

        var classObj = new Class
        {
            Id = Guid.NewGuid(),
            Name = "Class 10",
            Code = "CS10",
            AcademicYear = "2026",
            IsActive = true
        };

        var subject = new Subject
        {
            Id = Guid.NewGuid(),
            Name = "Computer Science",
            Code = "CS101",
            IsActive = true
        };

        var tcs = new TeacherClassSubject
        {
            Id = Guid.NewGuid(),
            ClassId = classObj.Id,
            SubjectId = subject.Id,
            TeacherId = teacher.Id,
            Class = classObj,
            Subject = subject,
            Teacher = teacher
        };

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            TeacherClassSubjectId = tcs.Id,
            CreatedByTeacherId = teacher.Id,
            Title = "Algorithm Design Assignment",
            Description = "Implement quicksort algorithm",
            Deadline = DateTime.UtcNow.AddDays(7),
            MaxMarks = 100,
            Status = AssignmentStatus.Published,
            AllowResubmission = true,
            TeacherClassSubject = tcs,
            CreatedByTeacher = teacher
        };

        context.Users.AddRange(student, teacher);
        context.Classes.Add(classObj);
        context.Subjects.Add(subject);
        context.TeacherClassSubjects.Add(tcs);
        context.Assignments.Add(assignment);
        context.SaveChangesAsync().Wait();

        return (student, teacher, classObj, subject, tcs, assignment);
    }
}
