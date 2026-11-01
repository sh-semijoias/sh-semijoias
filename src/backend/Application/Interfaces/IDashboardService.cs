using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Dashboard;

namespace ShSemijoias.Application.Interfaces;

public interface IDashboardService
{
    Task<Result<TicketMedioDto>> ObterTicketMedioAsync(ObterIndicadoresConsulta consulta);
    Task<Result<TicketMedioMensalDto>> ObterTicketMedioMensalAsync(ObterTicketMedioMensalConsulta consulta);
    Task<Result<MargemBrutaDto>> ObterMargemBrutaAsync(ObterIndicadoresConsulta consulta);
    Task<Result<DiasEstoqueDto>> ObterDiasEstoqueAsync(ObterIndicadoresConsulta consulta);
    Task<Result<PecasSemGiroDto>> ObterPecasSemGiroAsync();
}
