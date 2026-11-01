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
            : Math.Round((ticketAtual - ticketAnterior) / ticketAnterior * 100, 2, MidpointRounding.AwayFromZero);

        return Result<TicketMedioDto>.Ok(
            new TicketMedioDto(Math.Round(ticketAtual, 2, MidpointRounding.AwayFromZero), atual.QuantidadeVendas, variacao));
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
                decimal? ticket = vendas is null
                    ? null
                    : Math.Round(vendas.Faturamento / vendas.QuantidadeVendas, 2, MidpointRounding.AwayFromZero);
                return new TicketMedioMesDto(mes.Year, mes.Month, ticket);
            })
            .ToList();

        var totalVendas = vendasPorMes.Sum(v => v.QuantidadeVendas);
        decimal? itensPorVenda = totalVendas == 0
            ? null
            : Math.Round((decimal)vendasPorMes.Sum(v => v.QuantidadeItens) / totalVendas, 1, MidpointRounding.AwayFromZero);

        return Result<TicketMedioMensalDto>.Ok(new TicketMedioMensalDto(meses, itensPorVenda));
    }

    public async Task<Result<MargemBrutaDto>> ObterMargemBrutaAsync(ObterIndicadoresConsulta consulta)
    {
        var erros = ValidarConsulta(consulta);

        if (erros.Count > 0)
            return Result<MargemBrutaDto>.Falha(erros);

        var atual = await dashboardRepository.ObterResumoVendasAsync(consulta);
        var anterior = await dashboardRepository.ObterResumoVendasAsync(
            consulta.PeriodoAnterior());

        var margemAtual = CalcularMargemBruta(atual);
        var margemAnterior = CalcularMargemBruta(anterior);

        decimal? variacaoPercentual = margemAnterior == 0m
            ? null
            : Math.Round(
                margemAtual - margemAnterior,
                2,
                MidpointRounding.AwayFromZero);

        return Result<MargemBrutaDto>.Ok(
            new MargemBrutaDto(
                margemAtual,
                variacaoPercentual));
    }

    public async Task<Result<DiasEstoqueDto>>ObterDiasEstoqueAsync(ObterIndicadoresConsulta consulta)
    {
        var erros = ValidarConsulta(consulta);

        if (erros.Count > 0)
            return Result<DiasEstoqueDto>.Falha(erros);

        var resumo =
            await dashboardRepository
                .ObterResumoVendasAsync(consulta);

        var valorEstoque =
            await dashboardRepository
                .ObterValorEstoqueAtualAsync(consulta);

        var diasPeriodo =
            consulta.DataFim.DayNumber
            - consulta.DataInicio.DayNumber
            + 1;

        var dsi = resumo.Cmv == 0
            ? 0m
            : Math.Round(
                (valorEstoque / resumo.Cmv) * diasPeriodo,
                0,
                MidpointRounding.AwayFromZero);

        return Result<DiasEstoqueDto>.Ok(
            new DiasEstoqueDto(
                dsi,
                diasPeriodo));
    }

    private static decimal CalcularTicket(ResumoVendasPeriodo resumo) =>
        resumo.QuantidadeVendas == 0 ? 0m : resumo.Faturamento / resumo.QuantidadeVendas;

    private static decimal CalcularMargemBruta(
    ResumoVendasPeriodo resumo)
    {
        if (resumo.Faturamento == 0m)
            return 0m;

        return Math.Round(
            (
                resumo.Faturamento
                - resumo.Repasse
                - resumo.Cmv
            )
            / resumo.Faturamento
            * 100,
            2,
            MidpointRounding.AwayFromZero);
    }

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

