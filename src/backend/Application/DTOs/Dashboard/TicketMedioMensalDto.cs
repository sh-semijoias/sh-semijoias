namespace ShSemijoias.Application.DTOs.Dashboard;

public record TicketMedioMensalDto(IList<TicketMedioMesDto> Meses, decimal? ItensPorVenda);

// TicketMedio nulo indica mês sem vendas
public record TicketMedioMesDto(int Ano, int Mes, decimal? TicketMedio);
