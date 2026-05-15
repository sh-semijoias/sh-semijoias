namespace ShSemijoias.Domain.Entities;

public record VisaoVenda(
    int Id,
    DateTime DataVenda,
    string NomeCliente,
    string NomeRevendedora,
    int TotalProdutos,
    int TotalItens,
    decimal ValorTotal,
    string FormaPagamento
);
