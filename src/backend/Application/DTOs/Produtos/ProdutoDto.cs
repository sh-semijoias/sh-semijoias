namespace ShSemijoias.Application.DTOs.Produtos;

public record ProdutoDto(
    int IdProduto,
    string Descricao,
    string Categoria,
    decimal PrecoCompra,
    decimal PrecoVendaSugerido
);
