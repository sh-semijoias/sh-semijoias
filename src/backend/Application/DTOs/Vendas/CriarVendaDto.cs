namespace ShSemijoias.Application.DTOs.Vendas;

public record CriarVendaDto(
    int IdCliente,
    string? IdUsuario,
    int IdTipoPagamento,
    int TotalParcelas,
    string? Comentario,
    IList<ItemVendaDto> Itens);
