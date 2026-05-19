namespace ShSemijoias.Application.DTOs.Vendas;

public record ParcelaVendaDto(
    int Id,
    int NumeroParcela,
    decimal Valor,
    DateTime DataVencimento,
    bool Paga,
    DateTime? DataRecebimento);
