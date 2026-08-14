using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Entities;
using Assignment_Submission_Management_System_Backend.Core.Exceptions;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Infrastructure.Identity;
using Assignment_Submission_Management_System_Backend.Modules.Auth.DTOs;
using Assignment_Submission_Management_System_Backend.Modules.Auth.Services;
using Assignment_Submission_Management_System_Backend.Tests.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Assignment_Submission_Management_System_Backend.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly IOptions<JwtSettings> _jwtSettingsOptions;

    public AuthServiceTests()
    {
        _userManagerMock = MockHelpers.MockUserManager();
        _tokenServiceMock = new Mock<ITokenService>();
        _jwtSettingsOptions = Options.Create(new JwtSettings
        {
            Issuer = "TestIssuer",
            Audience = "TestAudience",
            SecretKey = "SuperSecretKeyForTestingPurposes123456!",
            ExpiryMinutes = 60
        });
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsAuthToken()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "user@test.com",
            FirstName = "Test",
            LastName = "User",
            IsActive = true
        };

        _userManagerMock.Setup(m => m.FindByEmailAsync("user@test.com")).ReturnsAsync(user);
        _userManagerMock.Setup(m => m.CheckPasswordAsync(user, "Password123!")).ReturnsAsync(true);
        _userManagerMock.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new List<string> { Roles.Student });
        _tokenServiceMock.Setup(t => t.GenerateTokenAsync(user, It.IsAny<IList<string>>())).ReturnsAsync("fake-jwt-token");

        var service = new AuthService(_userManagerMock.Object, _tokenServiceMock.Object, _jwtSettingsOptions);

        var request = new LoginRequestDto
        {
            Email = "user@test.com",
            Password = "Password123!"
        };

        // Act
        var response = await service.LoginAsync(request);

        // Assert
        Assert.NotNull(response);
        Assert.Equal("fake-jwt-token", response.Token);
        Assert.Equal(user.Id, response.UserId);
        Assert.Equal("user@test.com", response.Email);
        Assert.Equal("Test User", response.FullName);
        Assert.Contains(Roles.Student, response.Roles);
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ThrowsBadRequestException()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "user@test.com",
            IsActive = true
        };

        _userManagerMock.Setup(m => m.FindByEmailAsync("user@test.com")).ReturnsAsync(user);
        _userManagerMock.Setup(m => m.CheckPasswordAsync(user, "WrongPassword")).ReturnsAsync(false);

        var service = new AuthService(_userManagerMock.Object, _tokenServiceMock.Object, _jwtSettingsOptions);

        var request = new LoginRequestDto { Email = "user@test.com", Password = "WrongPassword" };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.LoginAsync(request));
        Assert.Contains("Invalid email or password", ex.Message);
    }

    [Fact]
    public async Task LoginAsync_DeactivatedUser_ThrowsForbiddenException()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Email = "deactive@test.com",
            IsActive = false
        };

        _userManagerMock.Setup(m => m.FindByEmailAsync("deactive@test.com")).ReturnsAsync(user);

        var service = new AuthService(_userManagerMock.Object, _tokenServiceMock.Object, _jwtSettingsOptions);

        var request = new LoginRequestDto { Email = "deactive@test.com", Password = "Password123!" };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<ForbiddenException>(() => service.LoginAsync(request));
        Assert.Contains("account has been deactivated", ex.Message);
    }

    [Fact]
    public async Task RegisterAsync_ValidRequest_CreatesUserAndReturnsToken()
    {
        // Arrange
        _userManagerMock.Setup(m => m.FindByEmailAsync("newuser@test.com")).ReturnsAsync((ApplicationUser?)null);
        _userManagerMock.Setup(m => m.CreateAsync(It.IsAny<ApplicationUser>(), "Password123!")).ReturnsAsync(IdentityResult.Success);
        _userManagerMock.Setup(m => m.AddToRoleAsync(It.IsAny<ApplicationUser>(), Roles.Teacher)).ReturnsAsync(IdentityResult.Success);
        _userManagerMock.Setup(m => m.GetRolesAsync(It.IsAny<ApplicationUser>())).ReturnsAsync(new List<string> { Roles.Teacher });
        _tokenServiceMock.Setup(t => t.GenerateTokenAsync(It.IsAny<ApplicationUser>(), It.IsAny<IList<string>>())).ReturnsAsync("new-jwt-token");

        var service = new AuthService(_userManagerMock.Object, _tokenServiceMock.Object, _jwtSettingsOptions);

        var request = new RegisterRequestDto
        {
            Email = "newuser@test.com",
            Password = "Password123!",
            FirstName = "New",
            LastName = "Teacher",
            Role = Roles.Teacher
        };

        // Act
        var response = await service.RegisterAsync(request);

        // Assert
        Assert.NotNull(response);
        Assert.Equal("new-jwt-token", response.Token);
        Assert.Equal("newuser@test.com", response.Email);
        Assert.Contains(Roles.Teacher, response.Roles);
    }

    [Fact]
    public async Task RegisterAsync_InvalidRole_ThrowsBadRequestException()
    {
        // Arrange
        var service = new AuthService(_userManagerMock.Object, _tokenServiceMock.Object, _jwtSettingsOptions);

        var request = new RegisterRequestDto
        {
            Email = "invalidrole@test.com",
            Password = "Password123!",
            FirstName = "Test",
            LastName = "User",
            Role = "SuperAdminFakeRole"
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.RegisterAsync(request));
        Assert.Contains("Invalid role", ex.Message);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsBadRequestException()
    {
        // Arrange
        var existingUser = new ApplicationUser { Email = "existing@test.com" };
        _userManagerMock.Setup(m => m.FindByEmailAsync("existing@test.com")).ReturnsAsync(existingUser);

        var service = new AuthService(_userManagerMock.Object, _tokenServiceMock.Object, _jwtSettingsOptions);

        var request = new RegisterRequestDto
        {
            Email = "existing@test.com",
            Password = "Password123!",
            FirstName = "Existing",
            LastName = "User",
            Role = Roles.Student
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<BadRequestException>(() => service.RegisterAsync(request));
        Assert.Contains("already registered", ex.Message);
    }
}
