namespace ShSemijoias.Application.DTOs.Produtos;

public record CriarProdutoDto(
    string Data,
    string Descricao,
    string Tipo,
    string PrecoCompra,
    string PrecoVendaSugerido
);
