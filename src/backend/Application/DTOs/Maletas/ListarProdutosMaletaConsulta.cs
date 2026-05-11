namespace ShSemijoias.Application.DTOs.Maletas;

public record ListarProdutosMaletaConsulta(
    int Pagina,
    int TamanhoPagina,
    string? Busca,
    int? IdMaletaContexto);
