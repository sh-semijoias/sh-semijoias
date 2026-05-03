namespace ShSemijoias.Application.DTOs.Produtos;

public record ProdutoDto(
    int IdProduto,
    DateTime Data,
    string Descricao,
    string Tipo,
    decimal PrecoCompra,
    decimal PrecoVendaSugerido
);
