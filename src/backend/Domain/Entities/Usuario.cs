using Microsoft.AspNetCore.Identity;

namespace ShSemijoias.Domain.Entities;

public class Usuario : IdentityUser<Guid>
{
    public string NomeCompleto { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
