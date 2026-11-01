namespace ShSemijoias.Domain.Entities;

// Ponto da curva ABC do dashboard, recortado do ranking no banco: posição, classe e percentuais acumulados (2 casas),
// repetindo os totais da classe e do período. UltimoDaClasse: ponto de corte da classe na curva.
public record LinhaCurvaAbc(
    int Posicao,
    string Classe,
    decimal PercentualProdutos,
    decimal PercentualAcumulado,
    bool UltimoDaClasse,
    int QuantidadeClasse,
    decimal FaturamentoClasse,
    decimal PercentualMixClasse,
    decimal PercentualFaturamentoClasse,
    int TotalProdutos,
    decimal FaturamentoTotal);
