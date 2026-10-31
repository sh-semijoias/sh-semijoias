namespace ShSemijoias.Domain.Entities;

public record FaturamentoProduto(int IdProduto, string Descricao, string Categoria, int QuantidadeVendida, decimal Faturamento);
