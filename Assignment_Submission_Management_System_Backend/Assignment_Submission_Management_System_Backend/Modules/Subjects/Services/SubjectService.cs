using Assignment_Submission_Management_System_Backend.Core.Entities;
using Assignment_Submission_Management_System_Backend.Core.Exceptions;
using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Infrastructure.Data;
using Assignment_Submission_Management_System_Backend.Modules.Subjects.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Assignment_Submission_Management_System_Backend.Modules.Subjects.Services;

public class SubjectService : ISubjectService
{
    private readonly ApplicationDbContext _context;

    public SubjectService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SubjectResponseDto>> GetAllAsync()
    {
        return await _context.Subjects
            .OrderBy(s => s.Name)
            .Select(s => MapToDto(s))
            .ToListAsync();
    }

    public async Task<SubjectResponseDto> GetByIdAsync(Guid id)
    {
        var entity = await _context.Subjects.FindAsync(id)
            ?? throw new NotFoundException("Subject not found.");
        return MapToDto(entity);
    }

    public async Task<SubjectResponseDto> CreateAsync(CreateSubjectRequestDto request)
    {
        if (await _context.Subjects.AnyAsync(s => s.Code == request.Code))
            throw new BadRequestException("Subject code already exists.");

        var entity = new Subject
        {
            Name = request.Name,
            Code = request.Code,
            Description = request.Description
        };

        _context.Subjects.Add(entity);
        await _context.SaveChangesAsync();
        return MapToDto(entity);
    }

    public async Task<SubjectResponseDto> UpdateAsync(Guid id, UpdateSubjectRequestDto request)
    {
        var entity = await _context.Subjects.FindAsync(id)
            ?? throw new NotFoundException("Subject not found.");

        entity.Name = request.Name;
        entity.Description = request.Description;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(entity);
    }

    public async Task DeleteAsync(Guid id)
    {
        var entity = await _context.Subjects.FindAsync(id)
            ?? throw new NotFoundException("Subject not found.");

        _context.Subjects.Remove(entity);
        await _context.SaveChangesAsync();
    }

    private static SubjectResponseDto MapToDto(Subject entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        Code = entity.Code,
        Description = entity.Description,
        IsActive = entity.IsActive,
        CreatedAt = entity.CreatedAt
    };
}
