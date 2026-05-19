using Microsoft.AspNetCore.Identity;

namespace ShSemijoias.Domain.Entities;

public class Usuario : IdentityUser<Guid>
{
    public string Nome { get; set; } = string.Empty;
    public DateTime DataCadastro { get; set; }
    public DateTime DataAtualizacao { get; set; }
    public bool SenhaProvisoriaAtiva { get; set; }
    public ICollection<Perfil> Perfis { get; set; } = [];
}
