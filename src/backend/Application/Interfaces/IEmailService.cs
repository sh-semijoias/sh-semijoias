namespace ShSemijoias.Application.Interfaces;

public interface IEmailService
{
    Task EnviarConviteAsync(string email, string link);
}
