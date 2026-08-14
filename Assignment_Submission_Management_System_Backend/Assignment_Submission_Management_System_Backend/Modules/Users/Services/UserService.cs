using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Entities;
using Assignment_Submission_Management_System_Backend.Core.Exceptions;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Infrastructure.Data;
using Assignment_Submission_Management_System_Backend.Modules.Users.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Assignment_Submission_Management_System_Backend.Modules.Users.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _context;

    public UserService(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<IEnumerable<UserResponseDto>> GetAllAsync()
    {
        var users = await _userManager.Users.OrderBy(u => u.FirstName).ToListAsync();
        var result = new List<UserResponseDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(MapToDto(user, roles));
        }

        return result;
    }

    public async Task<UserResponseDto> GetByIdAsync(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString())
            ?? throw new NotFoundException("User not found.");

        var roles = await _userManager.GetRolesAsync(user);
        return MapToDto(user, roles);
    }

    public async Task<UserResponseDto> CreateAsync(CreateUserRequestDto request)
    {
        if (!Roles.All.Contains(request.Role))
            throw new BadRequestException($"Invalid role. Allowed roles: {string.Join(", ", Roles.All)}");

        if (await _userManager.FindByEmailAsync(request.Email) is not null)
            throw new BadRequestException("Email is already registered.");

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            throw new BadRequestException(string.Join("; ", result.Errors.Select(e => e.Description)));

        await _userManager.AddToRoleAsync(user, request.Role);
        var roles = await _userManager.GetRolesAsync(user);
        return MapToDto(user, roles);
    }

    public async Task<UserResponseDto> UpdateAsync(Guid id, UpdateUserRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(id.ToString())
            ?? throw new NotFoundException("User not found.");

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new BadRequestException(string.Join("; ", result.Errors.Select(e => e.Description)));

        var roles = await _userManager.GetRolesAsync(user);
        return MapToDto(user, roles);
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString())
            ?? throw new NotFoundException("User not found.");

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            throw new BadRequestException(string.Join("; ", result.Errors.Select(e => e.Description)));
    }

    public async Task EnrollStudentAsync(EnrollStudentRequestDto request)
    {
        var student = await _userManager.FindByIdAsync(request.StudentId.ToString())
            ?? throw new NotFoundException("Student not found.");

        if (!await _userManager.IsInRoleAsync(student, Roles.Student))
            throw new BadRequestException("User must have the Student role to be enrolled.");

        var classExists = await _context.Classes.AnyAsync(c => c.Id == request.ClassId && c.IsActive);
        if (!classExists)
            throw new NotFoundException("Class not found or inactive.");

        var alreadyEnrolled = await _context.StudentEnrollments
            .AnyAsync(e => e.StudentId == request.StudentId && e.ClassId == request.ClassId && e.IsActive);
        if (alreadyEnrolled)
            throw new BadRequestException("Student is already enrolled in this class.");

        _context.StudentEnrollments.Add(new StudentEnrollment
        {
            StudentId = request.StudentId,
            ClassId = request.ClassId
        });

        await _context.SaveChangesAsync();
    }

    public async Task RemoveEnrollmentAsync(Guid enrollmentId)
    {
        var enrollment = await _context.StudentEnrollments.FindAsync(enrollmentId)
            ?? throw new NotFoundException("Enrollment not found.");

        enrollment.IsActive = false;
        enrollment.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<EnrollmentResponseDto>> GetStudentEnrollmentsAsync(Guid studentId)
    {
        return await _context.StudentEnrollments
            .Include(e => e.Student)
            .Include(e => e.Class)
            .Where(e => e.StudentId == studentId && e.IsActive)
            .Select(e => new EnrollmentResponseDto
            {
                Id = e.Id,
                StudentId = e.StudentId,
                StudentName = $"{e.Student.FirstName} {e.Student.LastName}",
                ClassId = e.ClassId,
                ClassName = e.Class.Name,
                IsActive = e.IsActive,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync();
    }

    private static UserResponseDto MapToDto(ApplicationUser user, IList<string> roles) => new()
    {
        Id = user.Id,
        Email = user.Email ?? string.Empty,
        FirstName = user.FirstName,
        LastName = user.LastName,
        IsActive = user.IsActive,
        Roles = roles,
        CreatedAt = user.CreatedAt
    };
}
