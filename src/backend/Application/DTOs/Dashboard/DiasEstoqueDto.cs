namespace ShSemijoias.Application.DTOs.Dashboard;

// DSI = estoque a custo ÷ CMV do período × dias do período. Nulo quando não houve vendas (CMV zero)
public record DiasEstoqueDto(
    decimal? DiasEstoque,
    int DiasBase,
    decimal ValorEstoque,
    decimal Cmv,
    IList<DiasEstoqueClasseDto> Classes);

// Sempre as três classes, A, B e C; DiasEstoque nulo quando a classe não vendeu no período
public record DiasEstoqueClasseDto(
    string Classe,
    decimal ValorEstoque,
    decimal Cmv,
    decimal? DiasEstoque);
