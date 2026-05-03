namespace ShSemijoias.Application.DTOs.Produtos;

public record EditarProdutoDto(
    string Descricao,
    string Tipo,
    decimal PrecoCompra,
    decimal PrecoVendaSugerido
);
