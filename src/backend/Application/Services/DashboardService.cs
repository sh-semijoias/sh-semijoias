using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Dashboard;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Services;

public class DashboardService(IDashboardRepository dashboardRepository) : IDashboardService
{
    private const int MesesTicketMensal = 12;
    private static readonly string[] ClassesAbc = ["A", "B", "C"];

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

    public async Task<Result<CurvaAbcDto>> ObterCurvaAbcAsync(ObterIndicadoresConsulta consulta)
    {
        var erros = ValidarConsulta(consulta);
        if (erros.Count > 0)
            return Result<CurvaAbcDto>.Falha(erros);

        // Ranking, acumulado, classes, destaques e totais já vêm calculados do banco: aqui só se agrupa o resultado
        var linhas = await dashboardRepository.ObterCurvaAbcAsync(consulta);
        var totais = linhas.FirstOrDefault();
        if (totais is null || totais.FaturamentoTotal == 0m)
            return Result<CurvaAbcDto>.Ok(new CurvaAbcDto(totais?.TotalProdutos ?? 0, 0m, [], []));

        var classes = new List<ClasseAbcDto>();
        // Classe sem produtos termina onde a anterior terminou
        var corte = (Produtos: 0m, Faturamento: 0m);
        foreach (var classe in ClassesAbc)
        {
            var daClasse = linhas.Where(l => l.Classe == classe).ToList();
            var ultimo = daClasse.FirstOrDefault(l => l.UltimoDaClasse);
            if (ultimo is not null)
                corte = (Arredondar(ultimo.PercentualProdutos, 2), Arredondar(ultimo.PercentualAcumulado, 2));

            // As linhas vêm na ordem do ranking; na classe C, a aba mostra do menor para o maior faturamento
            var destaques = daClasse.Where(l => l.Destaque);
            if (classe == "C")
                destaques = destaques.Reverse();

            classes.Add(new ClasseAbcDto(
                classe,
                ultimo?.QuantidadeClasse ?? 0,
                ultimo?.PercentualMixClasse ?? 0m,
                ultimo?.PercentualFaturamentoClasse ?? 0m,
                ultimo?.FaturamentoClasse ?? 0m,
                corte.Produtos,
                corte.Faturamento,
                destaques
                    .Select(l => new ProdutoAbcDto(
                        l.Posicao,
                        l.Descricao,
                        l.Categoria,
                        l.QuantidadeVendida,
                        l.Faturamento,
                        Arredondar(l.PercentualAcumulado, 1)))
                    .ToList()));
        }

        var pontos = linhas
            .Select(l => new PontoCurvaAbcDto(l.Posicao, l.Classe, Arredondar(l.PercentualProdutos, 2), Arredondar(l.PercentualAcumulado, 2)))
            .ToList();

        return Result<CurvaAbcDto>.Ok(new CurvaAbcDto(totais.TotalProdutos, totais.FaturamentoTotal, pontos, classes));
    }

    private static decimal Arredondar(decimal valor, int casas) =>
        Math.Round(valor, casas, MidpointRounding.AwayFromZero);

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
