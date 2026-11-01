namespace ShSemijoias.Domain.Entities;

// Produto da listagem de uma classe da curva ABC, recortado do ranking no banco. PercentualAcumulado com 1 casa.
// QuantidadeClasse: total de produtos da classe, para a paginação.
public record ProdutoClasseAbc(
    int Posicao,
    string Descricao,
    string Categoria,
    int QuantidadeVendida,
    decimal Faturamento,
    decimal PercentualAcumulado,
    int QuantidadeClasse);
