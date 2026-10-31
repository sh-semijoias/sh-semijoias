namespace ShSemijoias.Domain.Entities;

// Linha da curva ABC do dashboard, recortada do ranking no banco: um produto com posição, acumulado e classe, repetindo os
// totais da classe e do período. Percentuais já arredondados: 2 casas para a curva, 1 para o acumulado exibido nos destaques.
// Destaque: entre os 5 exibidos na aba da classe, na ordem de OrdemDestaque. UltimoDaClasse: ponto de corte da classe na curva.
public record LinhaCurvaAbc(
    int Posicao,
    string Descricao,
    string Categoria,
    int QuantidadeVendida,
    decimal Faturamento,
    string Classe,
    decimal PercentualProdutos,
    decimal PercentualAcumulado,
    decimal PercentualAcumuladoDestaque,
    bool Destaque,
    int OrdemDestaque,
    bool UltimoDaClasse,
    int QuantidadeClasse,
    decimal FaturamentoClasse,
    decimal PercentualMixClasse,
    decimal PercentualFaturamentoClasse,
    int TotalProdutos,
    decimal FaturamentoTotal);
