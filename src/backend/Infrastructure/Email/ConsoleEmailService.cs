using Microsoft.Extensions.Logging;
using ShSemijoias.Application.Interfaces;

namespace ShSemijoias.Infrastructure.Email;

public class ConsoleEmailService(ILogger<ConsoleEmailService> logger) : IEmailService
{
    public Task EnviarConviteAsync(string email, string link)
    {
        logger.LogInformation("CONVITE para {Email}: {Link}", email, link);
        return Task.CompletedTask;
    }
}
