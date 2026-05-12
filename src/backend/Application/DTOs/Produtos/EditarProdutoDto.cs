namespace ShSemijoias.Application.DTOs.Produtos;

public record EditarProdutoDto(
    string Descricao,
    int IdCategoria,
    decimal PrecoCompra,
    decimal PrecoVendaSugerido
);
