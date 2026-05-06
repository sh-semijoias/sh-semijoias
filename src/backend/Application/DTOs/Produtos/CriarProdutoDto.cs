namespace ShSemijoias.Application.DTOs.Produtos;

public record CriarProdutoDto(
    string Data,
    string Descricao,
    int IdCategoria,
    decimal PrecoCompra,
    decimal PrecoVendaSugerido
);
