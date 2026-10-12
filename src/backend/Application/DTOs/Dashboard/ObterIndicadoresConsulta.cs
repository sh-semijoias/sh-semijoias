namespace ShSemijoias.Application.DTOs.Dashboard;

public record ObterIndicadoresConsulta(
    DateOnly DataInicio,
    DateOnly DataFim,
    Guid? IdRevendedora = null,
    int? IdTipoProduto = null
)
{
    public ObterIndicadoresConsulta PeriodoAnterior()
    {
        var dias = DataFim.DayNumber - DataInicio.DayNumber + 1;
        return this with
        {
            DataInicio = DataInicio.AddDays(-dias),
            DataFim = DataInicio.AddDays(-1)
        };
    }
}
