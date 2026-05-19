namespace ShSemijoias.Domain.Entities;

public record ListarVendasResultado(
    IList<VisaoVenda> Items,
    int Total,
    int Pagina,
    int TamanhoPagina,
    decimal TotalVendasPeriodo,
    decimal TotalRecebidoPeriodo,
    decimal TotalLucroPrevistoPeriodo,
    decimal TotalLucroRealizadoPeriodo,
    decimal TotalRepassePrevistoPeriodo,
    decimal TotalRepasseRealizadoPeriodo
);
