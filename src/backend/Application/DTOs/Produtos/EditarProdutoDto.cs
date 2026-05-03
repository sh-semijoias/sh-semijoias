namespace ShSemijoias.Application.DTOs.Produtos;

public record EditarProdutoDto(
    string Descricao,
    string Tipo,
    string PrecoCompra,
    string PrecoVendaSugerido
);
