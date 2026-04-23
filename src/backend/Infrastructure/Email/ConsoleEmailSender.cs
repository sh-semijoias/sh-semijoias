using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Email;

public class ConsoleEmailSender(ILogger<ConsoleEmailSender> logger) : IEmailSender<Usuario>
{
    public Task SendConfirmationLinkAsync(Usuario user, string email, string confirmationLink) => Task.CompletedTask;

    public Task SendPasswordResetCodeAsync(Usuario user, string email, string resetCode) => Task.CompletedTask;

    public Task SendPasswordResetLinkAsync(Usuario user, string email, string resetLink)
    {
        logger.LogInformation("CONVITE para {Email}: {Link}", email, resetLink);
        return Task.CompletedTask;
    }
}
