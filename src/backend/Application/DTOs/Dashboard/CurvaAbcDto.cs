namespace ShSemijoias.Application.DTOs.Dashboard;

// PercentuaisAcumulados tem um ponto por produto, na ordem do ranking; vazio quando não houve faturamento
public record CurvaAbcDto(int TotalProdutos, decimal Faturamento, IList<decimal> PercentuaisAcumulados, IList<ClasseAbcDto> Classes);

// Produtos: os 5 de maior faturamento nas classes A e B; na C, os 5 de menor, do menor para o maior
public record ClasseAbcDto(
    string Classe,
    int QuantidadeProdutos,
    decimal PercentualMix,
    decimal PercentualFaturamento,
    decimal Faturamento,
    IList<ProdutoAbcDto> Produtos);

public record ProdutoAbcDto(
    int Posicao,
    string Descricao,
    string Categoria,
    int QuantidadeVendida,
    decimal Faturamento,
    decimal PercentualAcumulado);
