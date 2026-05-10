namespace ShSemijoias.Application.DTOs.Maletas;

public record ListarMaletasConsulta(
    int Pagina,
    int TamanhoPagina,
    string? Busca,
    Guid? IdUsuario = null,
    OrdenacaoMaleta OrdenarPor = OrdenacaoMaleta.Descricao,
    bool OrdemDecrescente = false
);
