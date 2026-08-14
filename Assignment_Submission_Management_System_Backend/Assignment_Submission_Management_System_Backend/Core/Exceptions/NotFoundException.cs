namespace Assignment_Submission_Management_System_Backend.Core.Exceptions;

public class NotFoundException : AppException
{
    public NotFoundException(string message) : base(message, 404) { }
}
