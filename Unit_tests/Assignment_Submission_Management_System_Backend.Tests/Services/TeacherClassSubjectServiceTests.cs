using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Entities;
using Assignment_Submission_Management_System_Backend.Core.Exceptions;
using Assignment_Submission_Management_System_Backend.Modules.TeacherClassSubjects.DTOs;
using Assignment_Submission_Management_System_Backend.Modules.TeacherClassSubjects.Services;
using Assignment_Submission_Management_System_Backend.Tests.Helpers;
using Microsoft.AspNetCore.Identity;
using Moq;
using Xunit;

namespace Assignment_Submission_Management_System_Backend.Tests.Services;

public class TeacherClassSubjectServiceTests
{
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;

    public TeacherClassSubjectServiceTests()
    {
        _userManagerMock = MockHelpers.MockUserManager();
    }

    [Fact]
    public async Task AssignTeacherAsync_ValidRequest_AssignsTeacherSuccessfully()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();

        var classObj = new Class { Id = Guid.NewGuid(), Name = "Class 9A", Code = "C9A", AcademicYear = "2026", IsActive = true };
        var subject = new Subject { Id = Guid.NewGuid(), Name = "Mathematics", Code = "MATH101", IsActive = true };
        var teacher = new ApplicationUser { Id = Guid.NewGuid(), Email = "teacher9a@school.com", FirstName = "Math", LastName = "Teacher" };

        context.Classes.Add(classObj);
        context.Subjects.Add(subject);
        context.Users.Add(teacher);
        await context.SaveChangesAsync();

        _userManagerMock.Setup(m => m.FindByIdAsync(teacher.Id.ToString())).ReturnsAsync(teacher);
        _userManagerMock.Setup(m => m.IsInRoleAsync(teacher, Roles.Teacher)).ReturnsAsync(true);

        var service = new TeacherClassSubjectService(context, _userManagerMock.Object);

        var request = new AssignTeacherRequestDto
        {
            ClassId = classObj.Id,
            SubjectId = subject.Id,
            TeacherId = teacher.Id
        };

        // Act
        var result = await service.AssignTeacherAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(classObj.Id, result.ClassId);
        Assert.Equal(subject.Id, result.SubjectId);
        Assert.Equal(teacher.Id, result.TeacherId);
    }

    [Fact]
    public async Task AssignTeacherAsync_NonTeacherUser_ThrowsBadRequestException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();

        var classObj = new Class { Id = Guid.NewGuid(), Name = "Class 9B", Code = "C9B", AcademicYear = "2026", IsActive = true };
        var subject = new Subject { Id = Guid.NewGuid(), Name = "Physics", Code = "PHY101", IsActive = true };
        var studentUser = new ApplicationUser { Id = Guid.NewGuid(), Email = "student@school.com", FirstName = "Not", LastName = "Teacher" };

        context.Classes.Add(classObj);
        context.Subjects.Add(subject);
        context.Users.Add(studentUser);
        await context.SaveChangesAsync();

        _userManagerMock.Setup(m => m.FindByIdAsync(studentUser.Id.ToString())).ReturnsAsync(studentUser);
        _userManagerMock.Setup(m => m.IsInRoleAsync(studentUser, Roles.Teacher)).ReturnsAsync(false);

        var service = new TeacherClassSubjectService(context, _userManagerMock.Object);

        var request = new AssignTeacherRequestDto
        {
            ClassId = classObj.Id,
            SubjectId = subject.Id,
            TeacherId = studentUser.Id
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.AssignTeacherAsync(request));
        Assert.Contains("must have the Teacher role", ex.Message);
    }

    [Fact]
    public async Task AssignTeacherAsync_DuplicateMapping_ThrowsBadRequestException()
    {
        // Arrange
        using var context = TestDbContextFactory.Create();

        var classObj = new Class { Id = Guid.NewGuid(), Name = "Class 9C", Code = "C9C", AcademicYear = "2026", IsActive = true };
        var subject = new Subject { Id = Guid.NewGuid(), Name = "Chemistry", Code = "CHEM101", IsActive = true };
        var teacher = new ApplicationUser { Id = Guid.NewGuid(), Email = "chem@school.com", FirstName = "Chem", LastName = "Teacher" };

        var existingTcs = new TeacherClassSubject
        {
            Id = Guid.NewGuid(),
            ClassId = classObj.Id,
            SubjectId = subject.Id,
            TeacherId = teacher.Id
        };

        context.Classes.Add(classObj);
        context.Subjects.Add(subject);
        context.Users.Add(teacher);
        context.TeacherClassSubjects.Add(existingTcs);
        await context.SaveChangesAsync();

        _userManagerMock.Setup(m => m.FindByIdAsync(teacher.Id.ToString())).ReturnsAsync(teacher);
        _userManagerMock.Setup(m => m.IsInRoleAsync(teacher, Roles.Teacher)).ReturnsAsync(true);

        var service = new TeacherClassSubjectService(context, _userManagerMock.Object);

        var request = new AssignTeacherRequestDto
        {
            ClassId = classObj.Id,
            SubjectId = subject.Id,
            TeacherId = teacher.Id
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.AssignTeacherAsync(request));
        Assert.Contains("already has a teacher assigned", ex.Message);
    }
}
