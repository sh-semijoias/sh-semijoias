using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.DTOs.Vendas;

public record ListarVendasResultado(
    IList<VisaoVenda> Items,
    int Total,
    int Pagina,
    int TamanhoPagina,
    decimal TotalVendasPeriodo,
    decimal TotalRecebidoPeriodo
);
