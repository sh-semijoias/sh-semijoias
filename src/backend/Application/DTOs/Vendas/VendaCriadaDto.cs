namespace ShSemijoias.Application.DTOs.Vendas;

public record VendaCriadaDto(int Id, DateTime DataVenda, decimal ValorTotal, int TotalParcelas);
