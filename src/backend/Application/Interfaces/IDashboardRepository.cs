using ShSemijoias.Application.DTOs.Dashboard;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Interfaces;

public interface IDashboardRepository
{
    Task<ResumoVendasPeriodo> ObterResumoVendasAsync(ObterIndicadoresConsulta consulta);
    Task<IList<VendasMes>> ObterVendasPorMesAsync(ObterIndicadoresConsulta consulta);
    Task<IList<EstoqueClasseAbc>> ObterEstoquePorClasseAbcAsync(ObterIndicadoresConsulta consulta);
    Task<IList<PecasFaixaIdade>> ObterPecasPorFaixaIdadeAsync(ObterIdadeEstoqueConsulta consulta, IList<DateTime> limitesFaixas);
    Task<IList<LinhaCurvaAbc>> ObterCurvaAbcAsync(ObterIndicadoresConsulta consulta);
    Task<(IList<ProdutoClasseAbc> Items, int Total)> ListarProdutosAbcAsync(ListarProdutosAbcConsulta consulta);
    Task<(IList<FaturamentoCliente> Items, int Total)> ListarFaturamentoClientesAsync(ListarFaturamentoClientesConsulta consulta);
}
