namespace ShSemijoias.Application.DTOs.Produtos;

public record ProdutoDto(
    int IdProduto,
    DateTime Data,
    string Descricao,
    string Categoria,
    decimal PrecoCompra,
    decimal PrecoVendaSugerido
);
