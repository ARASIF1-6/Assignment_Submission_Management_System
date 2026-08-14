using Assignment_Submission_Management_System_Backend.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Assignment_Submission_Management_System_Backend.Infrastructure.Data.Configurations;

public class TeacherClassSubjectConfiguration : IEntityTypeConfiguration<TeacherClassSubject>
{
    public void Configure(EntityTypeBuilder<TeacherClassSubject> builder)
    {
        builder.ToTable("TeacherClassSubjects");

        builder.HasIndex(cs => new { cs.ClassId, cs.SubjectId }).IsUnique();

        builder.HasOne(cs => cs.Class)
            .WithMany(c => c.TeacherClassSubjects)
            .HasForeignKey(cs => cs.ClassId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cs => cs.Subject)
            .WithMany(s => s.TeacherClassSubjects)
            .HasForeignKey(cs => cs.SubjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cs => cs.Teacher)
            .WithMany(u => u.TeachingAssignments)
            .HasForeignKey(cs => cs.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
