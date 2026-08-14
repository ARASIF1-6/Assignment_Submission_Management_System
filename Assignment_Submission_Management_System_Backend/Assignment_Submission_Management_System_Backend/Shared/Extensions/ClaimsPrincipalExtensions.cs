using System.Security.Claims;

namespace Assignment_Submission_Management_System_Backend.Shared.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var id = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(id, out var userId)
            ? userId
            : throw new UnauthorizedAccessException("User is not authenticated.");
    }

    public static string? GetPrimaryRole(this ClaimsPrincipal user) =>
        user.FindFirstValue(ClaimTypes.Role);
}
