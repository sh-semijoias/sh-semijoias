using Microsoft.AspNetCore.Identity;

namespace ShSemijoias.Domain.Entities;

public class Usuario : IdentityUser<Guid>
{
    public string Nome { get; set; } = string.Empty;
    public decimal? PercentualComissao { get; set; }
}
