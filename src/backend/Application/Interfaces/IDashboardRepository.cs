using ShSemijoias.Application.DTOs.Dashboard;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Interfaces;

public interface IDashboardRepository
{
    Task<ResumoVendasPeriodo> ObterResumoVendasAsync(ObterIndicadoresConsulta consulta);
    Task<IList<VendasMes>> ObterVendasPorMesAsync(ObterIndicadoresConsulta consulta);
    Task<decimal> ObterValorEstoqueAtualAsync(ObterIndicadoresConsulta consulta);
}
