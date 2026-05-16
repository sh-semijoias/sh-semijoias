namespace ShSemijoias.Domain.Entities;

public class ItemVenda
{
    public int Id { get; set; }
    public int IdVenda { get; set; }
    public Venda Venda { get; set; } = null!;
    public int IdEstoque { get; set; }
    public Estoque Estoque { get; set; } = null!;
    public int Quantidade { get; set; }
    public decimal PrecoVendaReal { get; set; }
    public decimal PrecoCompra { get; set; }
    public decimal PrecoVendaSugerido { get; set; }
}
