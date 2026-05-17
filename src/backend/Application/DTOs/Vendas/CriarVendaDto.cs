namespace ShSemijoias.Application.DTOs.Vendas;

public record CriarVendaDto(
    int IdCliente,
    int IdTipoPagamento,
    int TotalParcelas,
    string? Comentario,
    IList<ItemVendaDto> Itens);
