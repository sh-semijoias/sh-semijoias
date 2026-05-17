namespace ShSemijoias.Application.DTOs.Produtos;

public record ProdutoDto(
    int IdProduto,
    DateTime DataCadastro,
    string Descricao,
    string Categoria,
    decimal PrecoCompra,
    decimal PrecoVendaSugerido
);
