namespace ShSemijoias.Application.DTOs.Usuarios;

public record EditarProdutoDto(
    string Descricao,
    string Tipo,
    decimal PrecoCompra,
    decimal PrecoVendaSugerido
);
