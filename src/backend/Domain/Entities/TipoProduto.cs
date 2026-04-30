namespace ShSemijoias.Domain.Entities;

public class TipoProduto
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public bool Ativo { get; set; }
    public ICollection<Produto> Produtos { get; set; } = [];
}
