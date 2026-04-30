namespace ShSemijoias.Domain.Entities;

public class Venda
{
    public int Id { get; set; }
    public int IdCliente { get; set; }
    public Cliente Cliente { get; set; } = null!;
    public Guid IdUsuario { get; set; }
    public Usuario Usuario { get; set; } = null!;
    public int IdTipoPagamento { get; set; }
    public TipoPagamento TipoPagamento { get; set; } = null!;
    public int TotalParcelas { get; set; }
    public DateTime? DataCancelamento { get; set; }
    public string? Comentario { get; set; }
    public DateTime DataVenda { get; set; }
    public DateTime DataAtualizacao { get; set; }
    public ICollection<ItemVenda> Itens { get; set; } = [];
    public ICollection<Parcela> Parcelas { get; set; } = [];
}
