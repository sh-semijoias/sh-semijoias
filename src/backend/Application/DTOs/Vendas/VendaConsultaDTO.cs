namespace ShSemijoias.Application.DTOs.Vendas;

public record VendaDetalheDto(
    int Id,
    int IdCliente,
    string NomeCliente,
    Guid? IdUsuario,
    string? NomeRevendedora,
    int IdTipoPagamento,
    int TotalParcelas,
    string? Comentario,
    List<ItemVendaDetalheDto> Itens
);

public record ItemVendaDetalheDto(
    int IdEstoque,
    int IdProduto,
    string Produto,
    int Quantidade,
    decimal PrecoVendaReal
);