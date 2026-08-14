using Assignment_Submission_Management_System_Backend.Core.Entities;

namespace Assignment_Submission_Management_System_Backend.Core.Interfaces;

public interface ITokenService
{
    Task<string> GenerateTokenAsync(ApplicationUser user, IList<string> roles);
}
