namespace ShSemijoias.Application.DTOs.Produtos;

public record ProdutoDto(
    Guid IdProduto,
    string Data,
    string Descricao,
    string Tipo,
    string PrecoCompra,
    string PrecoVendaSugerido
);
