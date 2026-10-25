namespace ShSemijoias.Application.DTOs.Dashboard;

// Não recebe período: o indicador sempre cobre os últimos 12 meses
public record ObterTicketMedioMensalConsulta(Guid? IdRevendedora = null, int? IdTipoProduto = null);
