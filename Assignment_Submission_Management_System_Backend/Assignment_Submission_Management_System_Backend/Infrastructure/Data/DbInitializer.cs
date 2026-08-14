using Assignment_Submission_Management_System_Backend.Core.Constants;
using Assignment_Submission_Management_System_Backend.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Assignment_Submission_Management_System_Backend.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<Guid>> roleManager)
    {
        await context.Database.MigrateAsync();

        foreach (var role in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
            }
        }

        if (!context.AppSettings.Any())
        {
            context.AppSettings.AddRange(
                new AppSetting { Key = "AllowLateSubmissions", Value = "false", Description = "Whether late submissions are allowed globally" },
                new AppSetting { Key = "DefaultMaxMarks", Value = "100", Description = "Default maximum marks for new assignments" }
            );
            await context.SaveChangesAsync();
        }

        if (await userManager.FindByEmailAsync("admin@school.com") is null)
        {
            var admin = new ApplicationUser
            {
                UserName = "admin@school.com",
                Email = "admin@school.com",
                FirstName = "System",
                LastName = "Admin",
                EmailConfirmed = true
            };

            await userManager.CreateAsync(admin, "Admin@123");
            await userManager.AddToRoleAsync(admin, Roles.Admin);
        }
    }
}
