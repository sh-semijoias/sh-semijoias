namespace ShSemijoias.Domain.Entities;

public class CancelamentoVenda
{
    public int Id { get; set; }
    public int IdVenda { get; set; }
    public Venda Venda { get; set; } = null!;
    public int IdMotivoCancelamentoVenda { get; set; }
    public MotivoCancelamentoVenda MotivoCancelamentoVenda { get; set; } = null!;
    public DateTime DataCancelamento { get; set; }
}
