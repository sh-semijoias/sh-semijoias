namespace ShSemijoias.Domain.Entities;
public class Produto
{
    public Guid IdProduto { get; set; }
    public DateTime Data { get; set; }
    public string Descricao { get; set; } = null!;
    public string Tipo { get; set; } = null!;
    public decimal PrecoCompra { get; set; }
    public decimal PrecoVendaSugerido { get; set; }
    public TipoProduto TipoProduto { get; set; }
}
