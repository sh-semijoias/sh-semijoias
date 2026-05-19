namespace ShSemijoias.Domain.Entities;

public class Cliente
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public string? CPF { get; set; }
    public DateTime DataCadastro { get; set; }
    public DateTime DataAtualizacao { get; set; }
    // FK
    public Guid UsuarioId { get; set; }

    // Navegação
    public Usuario Usuario { get; set; } = null!;
}