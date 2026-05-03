namespace ShSemijoias.Application.DTOs.Usuarios;

public record UsuarioDto(
    Guid IdProduto,
    string Data,
    string Descricao,
    string Tipo,
    string PrecoCompra,
    string PrecoVendaSugerido
);
