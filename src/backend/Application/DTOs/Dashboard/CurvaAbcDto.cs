namespace ShSemijoias.Application.DTOs.Dashboard;

// Pontos vazios quando não houve faturamento
public record CurvaAbcDto(int TotalProdutos, decimal Faturamento, IList<PontoCurvaAbcDto> Pontos, IList<ClasseAbcDto> Classes);

// Ponto da curva, na ordem do ranking. Com muitos produtos, a curva vem amostrada, mas sempre inclui o último produto de cada classe.
public record PontoCurvaAbcDto(int Posicao, string Classe, decimal PercentualProdutos, decimal PercentualFaturamento);

// PercentualProdutosAcumulado e PercentualFaturamentoAcumulado: no último produto da classe (ponto de corte na curva).
// Produtos: os 5 de maior faturamento nas classes A e B; na C, os 5 de menor, do menor para o maior
public record ClasseAbcDto(
    string Classe,
    int QuantidadeProdutos,
    decimal PercentualMix,
    decimal PercentualFaturamento,
    decimal Faturamento,
    decimal PercentualProdutosAcumulado,
    decimal PercentualFaturamentoAcumulado,
    IList<ProdutoAbcDto> Produtos);

public record ProdutoAbcDto(
    int Posicao,
    string Descricao,
    string Categoria,
    int QuantidadeVendida,
    decimal Faturamento,
    decimal PercentualAcumulado);
