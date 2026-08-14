using Assignment_Submission_Management_System_Backend.Core.Entities;
using Assignment_Submission_Management_System_Backend.Core.Exceptions;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Infrastructure.Data;
using Assignment_Submission_Management_System_Backend.Modules.Classes.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Assignment_Submission_Management_System_Backend.Modules.Classes.Services;

public class ClassService : IClassService
{
    private readonly ApplicationDbContext _context;

    public ClassService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ClassResponseDto>> GetAllAsync()
    {
        return await _context.Classes
            .OrderBy(c => c.Name)
            .Select(c => MapToDto(c))
            .ToListAsync();
    }

    public async Task<ClassResponseDto> GetByIdAsync(Guid id)
    {
        var entity = await _context.Classes.FindAsync(id)
            ?? throw new NotFoundException("Class not found.");
        return MapToDto(entity);
    }

    public async Task<ClassResponseDto> CreateAsync(CreateClassRequestDto request)
    {
        if (await _context.Classes.AnyAsync(c => c.Code == request.Code))
            throw new BadRequestException("Class code already exists.");

        var entity = new Class
        {
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            AcademicYear = request.AcademicYear
        };

        _context.Classes.Add(entity);
        await _context.SaveChangesAsync();
        return MapToDto(entity);
    }

    public async Task<ClassResponseDto> UpdateAsync(Guid id, UpdateClassRequestDto request)
    {
        var entity = await _context.Classes.FindAsync(id)
            ?? throw new NotFoundException("Class not found.");

        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.AcademicYear = request.AcademicYear;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(entity);
    }

    public async Task DeleteAsync(Guid id)
    {
        var entity = await _context.Classes.FindAsync(id)
            ?? throw new NotFoundException("Class not found.");

        _context.Classes.Remove(entity);
        await _context.SaveChangesAsync();
    }

    private static ClassResponseDto MapToDto(Class entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        Code = entity.Code,
        Description = entity.Description,
        AcademicYear = entity.AcademicYear,
        IsActive = entity.IsActive,
        CreatedAt = entity.CreatedAt
    };
}
