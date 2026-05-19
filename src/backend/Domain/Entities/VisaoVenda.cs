namespace ShSemijoias.Domain.Entities;

public record VisaoVenda(
    int Id,
    DateTime DataVenda,
    string NomeCliente,
    Guid IdUsuario,
    string NomeRevendedora,
    int TotalItens,
    int TotalParcelas,
    decimal ValorTotal,
    string FormaPagamento,
    DateTime? DataCancelamento,
    string? NomeMotivoCancelamento,
    decimal ValorRecebido
);
