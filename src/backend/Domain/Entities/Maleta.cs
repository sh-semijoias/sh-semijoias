namespace ShSemijoias.Domain.Entities;

public class Maleta
{
    public int Id { get; set; }
    public Guid IdUsuario { get; set; }
    public Usuario Usuario { get; set; } = null!;
    public string Descricao { get; set; } = string.Empty;
    public DateTime DataCadastro { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
