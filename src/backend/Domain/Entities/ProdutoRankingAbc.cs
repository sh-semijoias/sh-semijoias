namespace ShSemijoias.Domain.Entities;

// Linha do ranking da curva ABC calculado no banco: um produto com posição, acumulado e classe, repetindo os totais da classe
// e do período. Base da curva do dashboard e de listagens paginadas, para que todas usem a mesma classificação.
// OrdemNaClasse e OrdemInversaNaClasse: posição dentro da classe, do maior e do menor faturamento (a partir de 1).
public record ProdutoRankingAbc(
    int Posicao,
    int IdProduto,
    string Descricao,
    string Categoria,
    int QuantidadeVendida,
    decimal Faturamento,
    string Classe,
    decimal PercentualProdutos,
    decimal PercentualAcumulado,
    int OrdemNaClasse,
    int OrdemInversaNaClasse,
    int QuantidadeClasse,
    decimal FaturamentoClasse,
    decimal PercentualMixClasse,
    decimal PercentualFaturamentoClasse,
    int TotalProdutos,
    decimal FaturamentoTotal);
