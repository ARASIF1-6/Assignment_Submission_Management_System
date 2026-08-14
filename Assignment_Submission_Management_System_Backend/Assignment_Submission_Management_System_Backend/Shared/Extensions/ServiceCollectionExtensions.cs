using Assignment_Submission_Management_System_Backend.Core.Interfaces;
using Assignment_Submission_Management_System_Backend.Infrastructure.Identity;
using Assignment_Submission_Management_System_Backend.Modules.Assignments.Services;
using Assignment_Submission_Management_System_Backend.Modules.Auth.Services;
using Assignment_Submission_Management_System_Backend.Modules.Classes.Services;
using Assignment_Submission_Management_System_Backend.Modules.Settings.Services;
using Assignment_Submission_Management_System_Backend.Modules.Subjects.Services;
using Assignment_Submission_Management_System_Backend.Modules.Submissions.Services;
using Assignment_Submission_Management_System_Backend.Modules.TeacherClassSubjects.Services;
using Assignment_Submission_Management_System_Backend.Modules.Users.Services;

namespace Assignment_Submission_Management_System_Backend.Shared.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IClassService, ClassService>();
        services.AddScoped<ISubjectService, SubjectService>();
        services.AddScoped<ITeacherClassSubjectService, TeacherClassSubjectService>();
        services.AddScoped<IAssignmentService, AssignmentService>();
        services.AddScoped<ISubmissionService, SubmissionService>();
        services.AddScoped<ISettingService, SettingService>();

        return services;
    }
}
