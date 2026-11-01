namespace ShSemijoias.Domain.Entities;

// Faturamento de um cliente com a revendedora que realizou as vendas, calculado no banco: o mesmo cliente atendido por duas
// revendedoras vira duas linhas. Posicao: no ranking por faturamento. PercentualTotal: sobre o faturamento de todos os clientes
// no período; PercentualDoMaior: em relação ao maior faturamento. DataUltimaCompra: no horário de Brasília, dentro do período.
// TotalLinhas: quantidade de linhas do ranking inteiro, para a paginação.
public record FaturamentoCliente(
    int Posicao,
    int IdCliente,
    string NomeCliente,
    Guid IdRevendedora,
    string NomeRevendedora,
    int QuantidadeVendas,
    decimal Faturamento,
    decimal PercentualTotal,
    decimal PercentualDoMaior,
    DateOnly DataUltimaCompra,
    int TotalLinhas);
