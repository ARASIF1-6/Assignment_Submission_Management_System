namespace Assignment_Submission_Management_System_Backend.Core.Exceptions;

public class BadRequestException : AppException
{
    public BadRequestException(string message) : base(message, 400) { }
}
