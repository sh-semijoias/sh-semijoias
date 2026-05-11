namespace ShSemijoias.Application.DTOs.Maletas;

public record CriarEditarMaletaDto(
    string Descricao,
    Guid IdUsuario,
    IList<ItemMaletaDto> Itens);
