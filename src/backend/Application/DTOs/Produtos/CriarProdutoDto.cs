namespace ShSemijoias.Application.DTOs.Produtos;

public record CriarProdutoDto(
    string Descricao,
    int IdCategoria,
    decimal PrecoCompra,
    decimal PrecoVendaSugerido
);
