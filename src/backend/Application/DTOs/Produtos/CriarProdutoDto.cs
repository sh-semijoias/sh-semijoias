namespace ShSemijoias.Application.DTOs.Usuarios;

public record CriarProdutoDto(
    string Data,
    string Descricao,
    string Tipo,
    decimal PrecoCompra,
    decimal PrecoVendaSugerido
);
