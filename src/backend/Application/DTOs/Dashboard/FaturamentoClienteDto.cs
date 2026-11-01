namespace ShSemijoias.Application.DTOs.Dashboard;

// Posicao: no ranking por faturamento, qualquer que seja a ordenação da listagem.
// PercentualTotal: sobre o faturamento de todos os clientes no período. PercentualDoMaior: em relação ao maior faturamento (barra).
public record FaturamentoClienteDto(
    int Posicao,
    int IdCliente,
    string NomeCliente,
    Guid IdRevendedora,
    string NomeRevendedora,
    int QuantidadeVendas,
    decimal Faturamento,
    decimal PercentualTotal,
    decimal PercentualDoMaior,
    DateOnly DataUltimaCompra);
