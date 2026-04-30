namespace ShSemijoias.Domain.Entities;

public class RecebimentoParcela
{
    public int Id { get; set; }
    public int IdParcela { get; set; }
    public Parcela Parcela { get; set; } = null!;
    public decimal ValorRecebido { get; set; }
    public DateTime DataRecebimento { get; set; }
}
