using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Dashboard;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Services;

public class DashboardService(IDashboardRepository dashboardRepository) : IDashboardService
{
    private const int MesesTicketMensal = 12;

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

    public async Task<Result<TicketMedioMensalDto>> ObterTicketMedioMensalAsync(ObterTicketMedioMensalConsulta consulta)
    {
        // Últimos 12 meses, incluindo o mês atual até hoje
        var hoje = FusoBrasilia.Hoje();
        var primeiroMes = new DateOnly(hoje.Year, hoje.Month, 1).AddMonths(-(MesesTicketMensal - 1));

        var vendasPorMes = await dashboardRepository.ObterVendasPorMesAsync(
            new ObterIndicadoresConsulta(primeiroMes, hoje, consulta.IdRevendedora, consulta.IdTipoProduto));

        var meses = Enumerable.Range(0, MesesTicketMensal)
            .Select(i => primeiroMes.AddMonths(i))
            .Select(mes =>
            {
                var vendas = vendasPorMes.FirstOrDefault(v => v.Ano == mes.Year && v.Mes == mes.Month);
                decimal? ticket = vendas is null ? null : Math.Round(vendas.Faturamento / vendas.QuantidadeVendas, 2);
                return new TicketMedioMesDto(mes.Year, mes.Month, ticket);
            })
            .ToList();

        var totalVendas = vendasPorMes.Sum(v => v.QuantidadeVendas);
        decimal? itensPorVenda = totalVendas == 0
            ? null
            : Math.Round((decimal)vendasPorMes.Sum(v => v.QuantidadeItens) / totalVendas, 1);

        return Result<TicketMedioMensalDto>.Ok(new TicketMedioMensalDto(meses, itensPorVenda));
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
