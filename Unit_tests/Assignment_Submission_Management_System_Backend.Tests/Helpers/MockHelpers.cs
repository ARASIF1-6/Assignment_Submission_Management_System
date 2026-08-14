using Assignment_Submission_Management_System_Backend.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace Assignment_Submission_Management_System_Backend.Tests.Helpers;

public static class MockHelpers
{
    public static Mock<UserManager<ApplicationUser>> MockUserManager()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();
        var userManager = new Mock<UserManager<ApplicationUser>>(
            store.Object, null!, null!, null!, null!, null!, null!, null!, null!);

        return userManager;
    }
}
