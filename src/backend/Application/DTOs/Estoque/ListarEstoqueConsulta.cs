namespace ShSemijoias.Application.DTOs.Estoque;

public record ListarEstoqueConsulta(
    int Pagina,
    int TamanhoPagina,
    int? IdProduto,
    bool? EmEstoque,
    string? Busca
);
