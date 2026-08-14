using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Entities;
using Assignment_Submission_Management_System_Backend.Core.Enums;
using Assignment_Submission_Management_System_Backend.Core.Exceptions;
using Assignment_Submission_Management_System_Backend.Infrastructure.Data;
using Assignment_Submission_Management_System_Backend.Modules.Assignments.DTOs;
using Assignment_Submission_Management_System_Backend.Modules.Assignments.Services;
using Assignment_Submission_Management_System_Backend.Tests.Helpers;
using Xunit;

namespace Assignment_Submission_Management_System_Backend.Tests.Services;

public class AssignmentServiceTests
{
    [Fact]
    public async Task CreateAsync_ValidRequest_CreatesDraftAssignment()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new AssignmentService(context);

        var (teacher, tcs) = SeedTeacherAndClassSubject(context);

        var request = new CreateAssignmentRequestDto
        {
            TeacherClassSubjectId = tcs.Id,
            Title = "Database Systems Homework",
            Description = "Design an ER diagram for university schema",
            Deadline = DateTime.UtcNow.AddDays(5),
            MaxMarks = 50,
            AllowResubmission = true
        };

        // Act
        var result = await service.CreateAsync(request, teacher.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Database Systems Homework", result.Title);
        Assert.Equal(50, result.MaxMarks);
        Assert.Equal(AssignmentStatus.Draft, result.Status);
    }

    [Fact]
    public async Task CreateAsync_UnassignedTeacher_ThrowsForbiddenException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new AssignmentService(context);

        var (teacher, tcs) = SeedTeacherAndClassSubject(context);
        var unassignedTeacherId = Guid.NewGuid();

        var request = new CreateAssignmentRequestDto
        {
            TeacherClassSubjectId = tcs.Id,
            Title = "Invalid Assignment",
            Description = "Test description",
            Deadline = DateTime.UtcNow.AddDays(5),
            MaxMarks = 100,
            AllowResubmission = true
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ForbiddenException>(() => service.CreateAsync(request, unassignedTeacherId));
        Assert.Contains("only create assignments for your assigned class-subjects", ex.Message);
    }

    [Fact]
    public async Task CreateAsync_PastDeadline_ThrowsBadRequestException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new AssignmentService(context);

        var (teacher, tcs) = SeedTeacherAndClassSubject(context);

        var request = new CreateAssignmentRequestDto
        {
            TeacherClassSubjectId = tcs.Id,
            Title = "Expired Assignment",
            Description = "Test description",
            Deadline = DateTime.UtcNow.AddDays(-1), // Past deadline
            MaxMarks = 100,
            AllowResubmission = true
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.CreateAsync(request, teacher.Id));
        Assert.Contains("Deadline must be in the future", ex.Message);
    }

    [Fact]
    public async Task PublishAsync_AssignedTeacher_PublishesAssignment()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new AssignmentService(context);

        var (teacher, tcs) = SeedTeacherAndClassSubject(context);

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            TeacherClassSubjectId = tcs.Id,
            CreatedByTeacherId = teacher.Id,
            Title = "Draft Assignment",
            Description = "Description",
            Deadline = DateTime.UtcNow.AddDays(3),
            MaxMarks = 100,
            Status = AssignmentStatus.Draft,
            AllowResubmission = true,
            TeacherClassSubject = tcs,
            CreatedByTeacher = teacher
        };
        context.Assignments.Add(assignment);
        await context.SaveChangesAsync();

        // Act
        var result = await service.PublishAsync(assignment.Id, teacher.Id, Roles.Teacher);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(AssignmentStatus.Published, result.Status);
    }

    [Fact]
    public async Task PublishAsync_UnassignedTeacher_ThrowsForbiddenException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new AssignmentService(context);

        var (teacher, tcs) = SeedTeacherAndClassSubject(context);
        var otherTeacherId = Guid.NewGuid();

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            TeacherClassSubjectId = tcs.Id,
            CreatedByTeacherId = teacher.Id,
            Title = "Draft Assignment",
            Description = "Description",
            Deadline = DateTime.UtcNow.AddDays(3),
            MaxMarks = 100,
            Status = AssignmentStatus.Draft,
            AllowResubmission = true,
            TeacherClassSubject = tcs,
            CreatedByTeacher = teacher
        };
        context.Assignments.Add(assignment);
        await context.SaveChangesAsync();

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ForbiddenException>(() => service.PublishAsync(assignment.Id, otherTeacherId, Roles.Teacher));
        Assert.Contains("only modify your own assignments", ex.Message);
    }

    [Fact]
    public async Task GetAllAsync_Student_ReturnsOnlyPublishedAssignmentsForEnrolledClasses()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new AssignmentService(context);

        var (teacher, tcs) = SeedTeacherAndClassSubject(context);
        var studentId = Guid.NewGuid();

        // Enroll student in class
        context.StudentEnrollments.Add(new StudentEnrollment
        {
            Id = Guid.NewGuid(),
            StudentId = studentId,
            ClassId = tcs.ClassId,
            IsActive = true
        });

        // Published assignment for enrolled class
        var publishedAssignment = new Assignment
        {
            Id = Guid.NewGuid(),
            TeacherClassSubjectId = tcs.Id,
            CreatedByTeacherId = teacher.Id,
            Title = "Published Homework",
            Description = "Visible",
            Deadline = DateTime.UtcNow.AddDays(3),
            MaxMarks = 100,
            Status = AssignmentStatus.Published,
            TeacherClassSubject = tcs,
            CreatedByTeacher = teacher
        };

        // Draft assignment for enrolled class (should be hidden from student)
        var draftAssignment = new Assignment
        {
            Id = Guid.NewGuid(),
            TeacherClassSubjectId = tcs.Id,
            CreatedByTeacherId = teacher.Id,
            Title = "Draft Homework",
            Description = "Hidden",
            Deadline = DateTime.UtcNow.AddDays(3),
            MaxMarks = 100,
            Status = AssignmentStatus.Draft,
            TeacherClassSubject = tcs,
            CreatedByTeacher = teacher
        };

        context.Assignments.AddRange(publishedAssignment, draftAssignment);
        await context.SaveChangesAsync();

        // Act
        var results = (await service.GetAllAsync(studentId, Roles.Student)).ToList();

        // Assert
        Assert.Single(results);
        Assert.Equal("Published Homework", results[0].Title);
    }

    [Fact]
    public async Task DeleteAsync_Teacher_DeletesAssignment()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();
        var service = new AssignmentService(context);

        var (teacher, tcs) = SeedTeacherAndClassSubject(context);

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            TeacherClassSubjectId = tcs.Id,
            CreatedByTeacherId = teacher.Id,
            Title = "To Be Deleted",
            Description = "Description",
            Deadline = DateTime.UtcNow.AddDays(3),
            MaxMarks = 100,
            Status = AssignmentStatus.Draft,
            TeacherClassSubject = tcs,
            CreatedByTeacher = teacher
        };
        context.Assignments.Add(assignment);
        await context.SaveChangesAsync();

        // Act
        await service.DeleteAsync(assignment.Id, teacher.Id, Roles.Teacher);

        // Assert
        Assert.Null(await context.Assignments.FindAsync(assignment.Id));
    }

    private static (ApplicationUser teacher, TeacherClassSubject tcs) SeedTeacherAndClassSubject(ApplicationDbContext context)
    {
        var teacher = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "prof@school.com",
            UserName = "prof@school.com",
            FirstName = "Alan",
            LastName = "Turing",
            IsActive = true
        };

        var classObj = new Class
        {
            Id = Guid.NewGuid(),
            Name = "CS-101",
            Code = "CS101",
            AcademicYear = "2026",
            IsActive = true
        };

        var subject = new Subject
        {
            Id = Guid.NewGuid(),
            Name = "Algorithms",
            Code = "ALG101",
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

        context.Users.Add(teacher);
        context.Classes.Add(classObj);
        context.Subjects.Add(subject);
        context.TeacherClassSubjects.Add(tcs);
        context.SaveChangesAsync().Wait();

        return (teacher, tcs);
    }
}
