namespace ShSemijoias.Domain.Entities;

public class Produto
{
    public int Id { get; set; }
    public int IdTipoProduto { get; set; }
    public TipoProduto TipoProduto { get; set; } = null!;
    public string Descricao { get; set; } = string.Empty;
    public decimal PrecoCompra { get; set; }
    public decimal PrecoVendaSugerido { get; set; }
    public DateTime DataCadastro { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
