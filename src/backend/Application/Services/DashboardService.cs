using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Dashboard;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Services;

public class DashboardService(IDashboardRepository dashboardRepository) : IDashboardService
{
    private const int MesesTicketMensal = 12;
    private static readonly string[] ClassesAbc = ["A", "B", "C"];
    private const int TamanhoMaximoPagina = 50;

    // Faixas de idade do estoque, na ordem do repositório (o índice é a faixa). DiasMaximos: idade máxima da faixa com venda;
    // a de "mais de 180 dias" é o que passa do último limite, e a de nunca vendido, os produtos sem venda
    private static readonly (string Codigo, string Descricao, int? DiasMaximos, bool SemGiro)[] FaixasIdade =
    [
        ("0-30", "0–30 dias", 30, false),
        ("31-60", "31–60 dias", 60, false),
        ("61-90", "61–90 dias", 90, false),
        ("91-180", "91–180 dias", 180, true),
        ("mais-180", "Mais de 180 dias", null, true),
        ("nunca", "Nunca vendido", null, true),
    ];

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

        // Lucro a partir dos valores arredondados: a cascata fecha no centavo
        var faturamento = Math.Round(atual.Faturamento, 2, MidpointRounding.AwayFromZero);
        var repasse = Math.Round(atual.Repasse, 2, MidpointRounding.AwayFromZero);
        var cmv = Math.Round(atual.Cmv, 2, MidpointRounding.AwayFromZero);

        return Result<MargemBrutaDto>.Ok(
            new MargemBrutaDto(
                margemAtual,
                variacaoPercentual,
                faturamento,
                repasse,
                cmv,
                faturamento - repasse - cmv));
    }

    public async Task<Result<DiasEstoqueDto>> ObterDiasEstoqueAsync(ObterIndicadoresConsulta consulta)
    {
        var erros = ValidarConsulta(consulta);
        if (erros.Count > 0)
            return Result<DiasEstoqueDto>.Falha(erros);

        var porClasse = await dashboardRepository.ObterEstoquePorClasseAbcAsync(consulta);
        var diasPeriodo = consulta.DataFim.DayNumber - consulta.DataInicio.DayNumber + 1;

        var classes = ClassesAbc
            .Select(classe =>
            {
                var linha = porClasse.FirstOrDefault(c => c.Classe == classe);
                var valorEstoque = linha?.ValorEstoque ?? 0m;
                var cmv = linha?.Cmv ?? 0m;
                return new DiasEstoqueClasseDto(
                    classe,
                    Math.Round(valorEstoque, 2, MidpointRounding.AwayFromZero),
                    Math.Round(cmv, 2, MidpointRounding.AwayFromZero),
                    CalcularDiasEstoque(valorEstoque, cmv, diasPeriodo));
            })
            .ToList();

        var valorTotal = porClasse.Sum(c => c.ValorEstoque);
        var cmvTotal = porClasse.Sum(c => c.Cmv);

        return Result<DiasEstoqueDto>.Ok(
            new DiasEstoqueDto(
                CalcularDiasEstoque(valorTotal, cmvTotal, diasPeriodo),
                diasPeriodo,
                Math.Round(valorTotal, 2, MidpointRounding.AwayFromZero),
                Math.Round(cmvTotal, 2, MidpointRounding.AwayFromZero),
                classes));
    }

    public async Task<Result<CurvaAbcDto>> ObterCurvaAbcAsync(ObterIndicadoresConsulta consulta)
    {
        var erros = ValidarConsulta(consulta);
        if (erros.Count > 0)
            return Result<CurvaAbcDto>.Falha(erros);

        // Tudo vem calculado do banco (ranking, classes, destaques, arredondamento): aqui as linhas só viram o DTO por classe
        var linhas = await dashboardRepository.ObterCurvaAbcAsync(consulta);
        var totais = linhas.FirstOrDefault();
        if (totais is null || totais.FaturamentoTotal == 0m)
            return Result<CurvaAbcDto>.Ok(new CurvaAbcDto(totais?.TotalProdutos ?? 0, 0m, [], []));

        var classes = new List<ClasseAbcDto>();
        foreach (var classe in ClassesAbc)
        {
            var ultimo = linhas.FirstOrDefault(l => l.Classe == classe && l.UltimoDaClasse);

            classes.Add(new ClasseAbcDto(
                classe,
                ultimo?.QuantidadeClasse ?? 0,
                ultimo?.PercentualMixClasse ?? 0m,
                ultimo?.PercentualFaturamentoClasse ?? 0m,
                ultimo?.FaturamentoClasse ?? 0m,
                ultimo?.PercentualProdutos,
                ultimo?.PercentualAcumulado));
        }

        var pontos = linhas
            .Select(l => new PontoCurvaAbcDto(l.Posicao, l.Classe, l.PercentualProdutos, l.PercentualAcumulado))
            .ToList();

        return Result<CurvaAbcDto>.Ok(new CurvaAbcDto(totais.TotalProdutos, totais.FaturamentoTotal, pontos, classes));
    }

    public async Task<Result<ListaPaginada<ProdutoAbcDto>>> ListarProdutosAbcAsync(ListarProdutosAbcConsulta consulta)
    {
        var erros = ValidarConsulta(consulta.Indicadores());

        if (!ClassesAbc.Contains(consulta.Classe))
            erros.Add("A classe deve ser A, B ou C.");

        if (consulta.Pagina < 1)
            erros.Add("A página deve ser maior que zero.");

        if (consulta.TamanhoPagina < 1 || consulta.TamanhoPagina > TamanhoMaximoPagina)
            erros.Add($"O tamanho da página deve estar entre 1 e {TamanhoMaximoPagina}.");

        if (erros.Count > 0)
            return Result<ListaPaginada<ProdutoAbcDto>>.Falha(erros);

        var (items, total) = await dashboardRepository.ListarProdutosAbcAsync(consulta);
        var dtos = items
            .Select(p => new ProdutoAbcDto(p.Posicao, p.Descricao, p.Categoria, p.QuantidadeVendida, p.Faturamento, p.PercentualAcumulado))
            .ToList();

        return Result<ListaPaginada<ProdutoAbcDto>>.Ok(
            new ListaPaginada<ProdutoAbcDto>(dtos, total, consulta.Pagina, consulta.TamanhoPagina));
    }

    public async Task<Result<ListaPaginada<FaturamentoClienteDto>>> ListarFaturamentoClientesAsync(ListarFaturamentoClientesConsulta consulta)
    {
        var erros = ValidarConsulta(consulta.Indicadores());

        if (consulta.Pagina < 1)
            erros.Add("A página deve ser maior que zero.");

        if (consulta.TamanhoPagina < 1 || consulta.TamanhoPagina > TamanhoMaximoPagina)
            erros.Add($"O tamanho da página deve estar entre 1 e {TamanhoMaximoPagina}.");

        if (erros.Count > 0)
            return Result<ListaPaginada<FaturamentoClienteDto>>.Falha(erros);

        var (items, total) = await dashboardRepository.ListarFaturamentoClientesAsync(consulta);
        var dtos = items
            .Select(c => new FaturamentoClienteDto(
                c.Posicao,
                c.IdCliente,
                c.NomeCliente,
                c.IdRevendedora,
                c.NomeRevendedora,
                c.QuantidadeVendas,
                c.Faturamento,
                c.PercentualTotal,
                c.PercentualDoMaior,
                c.DataUltimaCompra))
            .ToList();

        return Result<ListaPaginada<FaturamentoClienteDto>>.Ok(
            new ListaPaginada<FaturamentoClienteDto>(dtos, total, consulta.Pagina, consulta.TamanhoPagina));
    }

    // Sem vendas (CMV zero), o DSI não é calculado
    private static decimal? CalcularDiasEstoque(decimal valorEstoque, decimal cmv, int diasPeriodo) =>
        cmv == 0m ? null : Math.Round(valorEstoque / cmv * diasPeriodo, 0, MidpointRounding.AwayFromZero);

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

    public async Task<Result<IdadeEstoqueDto>> ObterIdadeEstoqueAsync(ObterIdadeEstoqueConsulta consulta)
    {
        // Idade em dias de calendário no horário de Brasília: venda de hoje tem 0 dias; a faixa "0–30" vai até a de 30 dias atrás
        var hoje = FusoBrasilia.Hoje();
        var limites = FaixasIdade
            .Where(f => f.DiasMaximos is not null)
            .Select(f => IntervaloUtc.De(hoje.AddDays(-f.DiasMaximos!.Value), hoje).Inicio)
            .ToList();

        var pecas = await dashboardRepository.ObterPecasPorFaixaIdadeAsync(consulta, limites);

        var faixas = FaixasIdade
            .Select((faixa, indice) =>
            {
                var pecasFaixa = pecas.FirstOrDefault(p => p.Faixa == indice);
                return new FaixaIdadeEstoqueDto(
                    faixa.Codigo,
                    faixa.Descricao,
                    pecasFaixa?.Quantidade ?? 0,
                    Math.Round(pecasFaixa?.Valor ?? 0m, 2, MidpointRounding.AwayFromZero),
                    faixa.SemGiro);
            })
            .ToList();

        var semGiro = faixas.Where(f => f.SemGiro).ToList();

        return Result<IdadeEstoqueDto>.Ok(
            new IdadeEstoqueDto(faixas, semGiro.Sum(f => f.Quantidade), semGiro.Sum(f => f.Valor)));
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

