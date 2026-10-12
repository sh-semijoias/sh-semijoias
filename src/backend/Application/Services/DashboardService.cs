using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Dashboard;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Services;

public class DashboardService(IDashboardRepository dashboardRepository) : IDashboardService
{
    public async Task<Result<TicketMedioDto>> ObterTicketMedioAsync(ObterIndicadoresConsulta consulta)
    {
        var erros = ValidarConsulta(consulta);
        if (erros.Count > 0)
            return Result<TicketMedioDto>.Falha(erros);

        var atual = await dashboardRepository.ObterResumoVendasAsync(consulta);
        var anterior = await dashboardRepository.ObterResumoVendasAsync(consulta.PeriodoAnterior());

        var ticketAtual = CalcularTicket(atual);
        var ticketAnterior = CalcularTicket(anterior);
        decimal? variacao = ticketAnterior == 0m
            ? null
            : Math.Round((ticketAtual - ticketAnterior) / ticketAnterior * 100, 2);

        return Result<TicketMedioDto>.Ok(
            new TicketMedioDto(Math.Round(ticketAtual, 2), atual.QuantidadeVendas, variacao));
    }

    private static decimal CalcularTicket(ResumoVendasPeriodo resumo) =>
        resumo.QuantidadeVendas == 0 ? 0m : resumo.Faturamento / resumo.QuantidadeVendas;

    private static List<string> ValidarConsulta(ObterIndicadoresConsulta consulta)
    {
        var erros = new List<string>();

        if (consulta.DataInicio == default)
            erros.Add("A data de início é obrigatória.");

        if (consulta.DataFim == default)
            erros.Add("A data de fim é obrigatória.");

        if (consulta.DataInicio != default && consulta.DataFim != default && consulta.DataInicio > consulta.DataFim)
            erros.Add("A data de início deve ser anterior ou igual à data de fim.");

        return erros;
    }
}
