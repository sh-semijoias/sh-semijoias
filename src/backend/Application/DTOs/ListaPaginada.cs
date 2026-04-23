namespace ShSemijoias.Application.DTOs;

public record ListaPaginada<T>(IList<T> Items, int Total, int Pagina, int TamanhoPagina);
