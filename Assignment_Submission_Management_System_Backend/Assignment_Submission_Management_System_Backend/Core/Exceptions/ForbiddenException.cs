namespace Assignment_Submission_Management_System_Backend.Core.Exceptions;

public class ForbiddenException : AppException
{
    public ForbiddenException(string message) : base(message, 403) { }
}
