namespace ShSemijoias.Application.DTOs.Dashboard;

public record ListarFaturamentoClientesConsulta(
    DateOnly DataInicio,
    DateOnly DataFim,
    Guid? IdRevendedora = null,
    int? IdTipoProduto = null,
    int Pagina = 1,
    int TamanhoPagina = 10,
    OrdenacaoFaturamentoCliente OrdenarPor = OrdenacaoFaturamentoCliente.Faturamento,
    bool OrdemDecrescente = true
)
{
    public ObterIndicadoresConsulta Indicadores() => new(DataInicio, DataFim, IdRevendedora, IdTipoProduto);
}
