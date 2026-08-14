using Assignment_Submission_Management_System_Backend.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Assignment_Submission_Management_System_Backend.Infrastructure.Data.Configurations;

public class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
{
    public void Configure(EntityTypeBuilder<Assignment> builder)
    {
        builder.Property(a => a.Title).HasMaxLength(300).IsRequired();
        builder.Property(a => a.MaxMarks).HasPrecision(5, 2);

        builder.HasOne(a => a.TeacherClassSubject)
            .WithMany(cs => cs.Assignments)
            .HasForeignKey(a => a.TeacherClassSubjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.CreatedByTeacher)
            .WithMany(u => u.CreatedAssignments)
            .HasForeignKey(a => a.CreatedByTeacherId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
