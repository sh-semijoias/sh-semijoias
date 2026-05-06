namespace ShSemijoias.Application.DTOs.Estoque;

public record EstoqueDto(
    int Id,
    int IdProduto,
    string Produto,
    int IdTipoProduto,
    string Tipo,
    int Quantidade,
    decimal PrecoCompra,
    decimal PrecoVendaSugerido
);
