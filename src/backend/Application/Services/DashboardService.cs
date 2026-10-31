using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Dashboard;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Services;

public class DashboardService(IDashboardRepository dashboardRepository) : IDashboardService
{
    private const int MesesTicketMensal = 12;
    private const decimal LimiteClasseA = 80m;
    private const decimal LimiteClasseB = 95m;
    private const int ProdutosPorClasse = 5;
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

        // Desempate pela quantidade e pelo nome, para o ranking não mudar entre requisições
        var produtos = (await dashboardRepository.ObterFaturamentoPorProdutoAsync(consulta))
            .OrderByDescending(p => p.Faturamento)
            .ThenByDescending(p => p.QuantidadeVendida)
            .ThenBy(p => p.Descricao)
            .ToList();

        var faturamentoTotal = produtos.Sum(p => p.Faturamento);
        if (faturamentoTotal == 0m)
            return Result<CurvaAbcDto>.Ok(new CurvaAbcDto(produtos.Count, 0m, [], []));

        // A classe vem do acumulado antes do produto: quem faz o acumulado passar de um limite fica na classe desse limite
        var classificados = new List<ProdutoClassificado>();
        var acumulado = 0m;
        foreach (var produto in produtos)
        {
            var classe = ClassificarAbc(acumulado / faturamentoTotal * 100);
            acumulado += produto.Faturamento;
            classificados.Add(new ProdutoClassificado(classificados.Count + 1, produto, classe, acumulado / faturamentoTotal * 100));
        }

        var classes = ClassesAbc
            .Select(classe =>
            {
                var daClasse = classificados.Where(p => p.Classe == classe).ToList();
                var faturamento = daClasse.Sum(p => p.Produto.Faturamento);
                var destaques = classe == "C" ? Enumerable.Reverse(daClasse) : daClasse;

                return new ClasseAbcDto(
                    classe,
                    daClasse.Count,
                    Percentual(daClasse.Count, produtos.Count),
                    Percentual(faturamento, faturamentoTotal),
                    Math.Round(faturamento, 2, MidpointRounding.AwayFromZero),
                    destaques.Take(ProdutosPorClasse).Select(ParaProdutoAbcDto).ToList());
            })
            .ToList();

        var percentuaisAcumulados = classificados
            .Select(p => Math.Round(p.PercentualAcumulado, 2, MidpointRounding.AwayFromZero))
            .ToList();

        return Result<CurvaAbcDto>.Ok(new CurvaAbcDto(
            produtos.Count,
            Math.Round(faturamentoTotal, 2, MidpointRounding.AwayFromZero),
            percentuaisAcumulados,
            classes));
    }

    private record ProdutoClassificado(int Posicao, FaturamentoProduto Produto, string Classe, decimal PercentualAcumulado);

    private static string ClassificarAbc(decimal percentualAcumuladoAnterior) =>
        percentualAcumuladoAnterior < LimiteClasseA ? "A"
        : percentualAcumuladoAnterior < LimiteClasseB ? "B"
        : "C";

    private static ProdutoAbcDto ParaProdutoAbcDto(ProdutoClassificado p) =>
        new(
            p.Posicao,
            p.Produto.Descricao,
            p.Produto.Categoria,
            p.Produto.QuantidadeVendida,
            Math.Round(p.Produto.Faturamento, 2, MidpointRounding.AwayFromZero),
            Math.Round(p.PercentualAcumulado, 1, MidpointRounding.AwayFromZero));

    private static decimal Percentual(decimal parte, decimal total) =>
        Math.Round(parte / total * 100, 1, MidpointRounding.AwayFromZero);

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
