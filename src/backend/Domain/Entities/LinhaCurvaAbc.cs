namespace ShSemijoias.Domain.Entities;

// Linha da curva ABC calculada no banco: um produto com posição, acumulado e classe, repetindo os totais da classe e do período.
// Destaque: entre os 5 exibidos na aba da classe. UltimoDaClasse: ponto de corte da classe na curva.
public record LinhaCurvaAbc(
    int Posicao,
    string Descricao,
    string Categoria,
    int QuantidadeVendida,
    decimal Faturamento,
    string Classe,
    decimal PercentualProdutos,
    decimal PercentualAcumulado,
    bool Destaque,
    bool UltimoDaClasse,
    int QuantidadeClasse,
    decimal FaturamentoClasse,
    decimal PercentualMixClasse,
    decimal PercentualFaturamentoClasse,
    int TotalProdutos,
    decimal FaturamentoTotal);
