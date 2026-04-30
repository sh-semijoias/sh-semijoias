namespace ShSemijoias.Domain.Entities;

public class Parcela
{
    public int Id { get; set; }
    public int IdVenda { get; set; }
    public Venda Venda { get; set; } = null!;
    public int NumeroParcela { get; set; }
    public decimal Valor { get; set; }
    public DateTime DataVencimento { get; set; }
    public ICollection<RecebimentoParcela> Recebimentos { get; set; } = [];
}
