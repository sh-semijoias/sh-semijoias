namespace ShSemijoias.Application.DTOs.Maletas;

public record MaletaDetalheDto(
    int Id,
    string Descricao,
    Guid IdUsuario,
    string NomeUsuario,
    IList<ItemMaletaDetalheDto> Itens);
