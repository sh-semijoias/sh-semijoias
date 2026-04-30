namespace ShSemijoias.Domain.Entities;

public class TipoPagamento
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public bool Ativo { get; set; }
}
