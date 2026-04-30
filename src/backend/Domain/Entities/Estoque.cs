namespace ShSemijoias.Domain.Entities;

public class Estoque
{
    public int Id { get; set; }
    public int IdProduto { get; set; }
    public Produto Produto { get; set; } = null!;
    public int? IdMaleta { get; set; }
    public Maleta? Maleta { get; set; }
    public int Quantidade { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
