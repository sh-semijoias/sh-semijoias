using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Dashboard;

namespace ShSemijoias.Application.Interfaces;

public interface IDashboardService
{
    Task<Result<TicketMedioDto>> ObterTicketMedioAsync(ObterIndicadoresConsulta consulta);
    Task<Result<TicketMedioMensalDto>> ObterTicketMedioMensalAsync(ObterTicketMedioMensalConsulta consulta);
    Task<Result<CurvaAbcDto>> ObterCurvaAbcAsync(ObterIndicadoresConsulta consulta);
    Task<Result<ListaPaginada<FaturamentoClienteDto>>> ListarFaturamentoClientesAsync(ListarFaturamentoClientesConsulta consulta);
}
