using Microsoft.EntityFrameworkCore;
using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Dashboard;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;
using ShSemijoias.Infrastructure.Persistence;
using ShSemijoias.Domain.Enums;

namespace ShSemijoias.Infrastructure.Repositories;

public class DashboardRepository(ApplicationDbContext context) : IDashboardRepository
{
    public async Task<ResumoVendasPeriodo> ObterResumoVendasAsync(ObterIndicadoresConsulta consulta)
    {
        var itens = ItensVendidos(consulta);

        var faturamento = await itens.SumAsync(i => (decimal?)(i.PrecoVendaReal * i.Quantidade)) ?? 0m;
        var quantidadeVendas = await itens.Select(i => i.IdVenda).Distinct().CountAsync();
        var cmv = await itens.SumAsync(i =>(decimal?)(i.PrecoCompra * i.Quantidade))?? 0m;
        var repasse = await itens.SumAsync(i =>i.Venda.Usuario.Perfis.Any(p => p.Name == Perfis.Revendedor)? (decimal?)((i.PrecoVendaReal - i.PrecoVendaSugerido) * i.Quantidade): 0m) ?? 0m;

        return new ResumoVendasPeriodo(faturamento, quantidadeVendas, cmv , repasse);
    }

    public async Task<IList<VendasMes>> ObterVendasPorMesAsync(ObterIndicadoresConsulta consulta)
    {
        // Agrupa pelo mês no horário de Brasília, para que vendas da noite do último dia não caiam no mês seguinte
        return await (
            from item in ItensVendidos(consulta)
            group item by new
            {
                TimeZoneInfo.ConvertTimeBySystemTimeZoneId(item.Venda.DataVenda, FusoBrasilia.Id).Year,
                TimeZoneInfo.ConvertTimeBySystemTimeZoneId(item.Venda.DataVenda, FusoBrasilia.Id).Month
            } into mes
            select new VendasMes(
                mes.Key.Year,
                mes.Key.Month,
                mes.Sum(i => i.PrecoVendaReal * i.Quantidade),
                mes.Select(i => i.IdVenda).Distinct().Count(),
                mes.Sum(i => i.Quantidade))
        ).ToListAsync();
    }

    // Estoque a custo e CMV do período por classe da curva ABC, em uma única query sobre o ranking.
    // O total do DSI é a soma das classes: o ranking inclui todo produto vendido e todo produto com estoque no escopo dos filtros
    public async Task<IList<EstoqueClasseAbc>> ObterEstoquePorClasseAbcAsync(ObterIndicadoresConsulta consulta)
    {
        return await (
            from produto in RankingAbc(consulta)
            group produto by produto.Classe into classe
            select new EstoqueClasseAbc(
                classe.Key,
                classe.Sum(p => p.ValorEstoque),
                classe.Sum(p => p.Cmv))
        ).ToListAsync();
    }

    // Curva do dashboard: do ranking completo, só o último produto de cada classe (cortes) e uma amostra de pontos.
    // O resultado tem tamanho fixo, qualquer que seja o catálogo.
    public async Task<IList<LinhaCurvaAbc>> ObterCurvaAbcAsync(ObterIndicadoresConsulta consulta)
    {
        // Acima disso, a curva vem amostrada (um ponto a cada N produtos); abaixo, um ponto por produto
        const int pontosCurva = 200;

        return await (
            from produto in RankingAbc(consulta)
            let ultimoDaClasse = produto.OrdemInversaNaClasse == 1
            // Passo da amostragem: divisão inteira arredondada para cima
            let passo = (produto.TotalProdutos + pontosCurva - 1) / pontosCurva
            where ultimoDaClasse || produto.Posicao % passo == 0
            orderby produto.Posicao
            select new LinhaCurvaAbc(
                produto.Posicao,
                produto.Classe,
                // round() do PostgreSQL arredonda numeric para longe do zero no empate, como o resto da API
                Math.Round(produto.PercentualProdutos, 2),
                Math.Round(produto.PercentualAcumulado, 2),
                ultimoDaClasse,
                produto.QuantidadeClasse,
                produto.FaturamentoClasse,
                produto.PercentualMixClasse,
                produto.PercentualFaturamentoClasse,
                produto.TotalProdutos,
                produto.FaturamentoTotal)
        ).ToListAsync();
    }

    // Produtos de uma classe, paginados: A e B do maior para o menor faturamento; C do menor para o maior
    public async Task<(IList<ProdutoClasseAbc> Items, int Total)> ListarProdutosAbcAsync(ListarProdutosAbcConsulta consulta)
    {
        var daClasse = RankingAbc(consulta.Indicadores())
            .Where(p => p.Classe == consulta.Classe);

        // As ordens na classe são únicas: a página não muda entre requisições
        var ordenado = consulta.Classe == "C"
            ? daClasse.OrderBy(p => p.OrdemInversaNaClasse)
            : daClasse.OrderBy(p => p.OrdemNaClasse);

        var items = await ordenado
            .Skip((consulta.Pagina - 1) * consulta.TamanhoPagina)
            .Take(consulta.TamanhoPagina)
            .Select(p => new ProdutoClasseAbc(
                p.Posicao,
                p.Descricao,
                p.Categoria,
                p.QuantidadeVendida,
                p.Faturamento,
                // round() do PostgreSQL arredonda numeric para longe do zero no empate, como o resto da API
                Math.Round(p.PercentualAcumulado, 1),
                p.QuantidadeClasse))
            .ToListAsync();

        // O total é a quantidade da classe, que vem do ranking: sem um COUNT à parte. Página além do fim não traz linhas nem total
        return (items, items.FirstOrDefault()?.QuantidadeClasse ?? 0);
    }

    public async Task<(IList<FaturamentoCliente> Items, int Total)> ListarFaturamentoClientesAsync(ListarFaturamentoClientesConsulta consulta)
    {
        var ranking = RankingClientes(consulta);
        // Texto ordenado com a collation ICU, como no ranking: a padrão do banco põe as acentuadas depois de z
        const string collation = "pt-BR-x-icu";

        var ordenado = consulta.OrdenarPor switch
        {
            OrdenacaoFaturamentoCliente.NomeCliente => consulta.OrdemDecrescente
                ? ranking.OrderByDescending(c => EF.Functions.Collate(c.NomeCliente, collation))
                : ranking.OrderBy(c => EF.Functions.Collate(c.NomeCliente, collation)),
            OrdenacaoFaturamentoCliente.NomeRevendedora => consulta.OrdemDecrescente
                ? ranking.OrderByDescending(c => EF.Functions.Collate(c.NomeRevendedora, collation))
                : ranking.OrderBy(c => EF.Functions.Collate(c.NomeRevendedora, collation)),
            OrdenacaoFaturamentoCliente.QuantidadeVendas => consulta.OrdemDecrescente
                ? ranking.OrderByDescending(c => c.QuantidadeVendas)
                : ranking.OrderBy(c => c.QuantidadeVendas),
            OrdenacaoFaturamentoCliente.DataUltimaCompra => consulta.OrdemDecrescente
                ? ranking.OrderByDescending(c => c.DataUltimaCompra)
                : ranking.OrderBy(c => c.DataUltimaCompra),
            // Faturamento: a posição no ranking já desempata
            _ => consulta.OrdemDecrescente
                ? ranking.OrderBy(c => c.Posicao)
                : ranking.OrderByDescending(c => c.Posicao),
        };

        // Empates nas outras colunas seguem a posição no ranking, para a página não mudar entre requisições
        var items = await ordenado
            .ThenBy(c => c.Posicao)
            .Skip((consulta.Pagina - 1) * consulta.TamanhoPagina)
            .Take(consulta.TamanhoPagina)
            .ToListAsync();

        // O total vem de uma função de janela no ranking: sem um COUNT à parte. Página além do fim não traz linhas nem total
        return (items, items.FirstOrDefault()?.TotalLinhas ?? 0);
    }

    // Ranking de faturamento por cliente e pela revendedora que realizou a venda, uma linha por par, com a posição e os
    // percentuais calculados no banco com funções de janela. Composável: quem usa ordena e pagina em LINQ por cima.
    private IQueryable<FaturamentoCliente> RankingClientes(ListarFaturamentoClientesConsulta consulta)
    {
        var intervalo = IntervaloUtc.De(consulta.DataInicio, consulta.DataFim);

        return context.Database.SqlQuery<FaturamentoCliente>($"""
            WITH por_cliente AS (
                -- Vendas não canceladas no período, com os filtros do dashboard. Agrupa pela revendedora da venda, não pela
                -- do cadastro do cliente: o administrador pode registrar a venda em nome de outra revendedora
                SELECT v.id_cliente,
                       v.id_usuario,
                       count(DISTINCT v.id) AS quantidade_vendas,
                       sum(i.preco_venda_real * i.quantidade) AS faturamento,
                       max(v.data_venda) AS ultima_venda
                FROM item_venda i
                JOIN venda v ON v.id = i.id_venda
                JOIN estoque e ON e.id = i.id_estoque
                JOIN produto p ON p.id = e.id_produto
                LEFT JOIN cancelamento_venda c ON c.id_venda = v.id
                WHERE c.id IS NULL
                  AND v.data_venda >= {intervalo.Inicio}
                  AND v.data_venda < {intervalo.FimExclusivo}
                  AND ({consulta.IdRevendedora}::uuid IS NULL OR v.id_usuario = {consulta.IdRevendedora}::uuid)
                  AND ({consulta.IdTipoProduto}::int IS NULL OR p.id_tipo_produto = {consulta.IdTipoProduto}::int)
                GROUP BY v.id_cliente, v.id_usuario
            )
            -- Desempate por quantidade de vendas, nomes e ids, para o ranking não mudar entre requisições
            SELECT row_number() OVER (ORDER BY pc.faturamento DESC, pc.quantidade_vendas DESC, cl.nome COLLATE "pt-BR-x-icu", cl.id,
                                               u.nome COLLATE "pt-BR-x-icu", u.id)::int AS posicao,
                   cl.id AS id_cliente,
                   cl.nome AS nome_cliente,
                   u.id AS id_revendedora,
                   u.nome AS nome_revendedora,
                   pc.quantidade_vendas::int AS quantidade_vendas,
                   round(pc.faturamento, 2) AS faturamento,
                   -- Sobre todas as linhas do ranking, não só as da página: as janelas são calculadas antes do LIMIT
                   round(coalesce(pc.faturamento * 100 / nullif(sum(pc.faturamento) OVER (), 0), 0), 1) AS percentual_total,
                   round(coalesce(pc.faturamento * 100 / nullif(max(pc.faturamento) OVER (), 0), 0), 1) AS percentual_do_maior,
                   (pc.ultima_venda AT TIME ZONE {FusoBrasilia.Id})::date AS data_ultima_compra,
                   count(*) OVER ()::int AS total_linhas
            FROM por_cliente pc
            JOIN cliente cl ON cl.id = pc.id_cliente
            JOIN usuario u ON u.id = pc.id_usuario
            """);
    }

    // Ranking completo da curva ABC, uma linha por produto, calculado no banco com funções de janela (o EF Core não as
    // traduz a partir do LINQ, por isso o SQL escrito à mão). É composável: quem usa filtra, ordena e pagina em LINQ por cima,
    // e todas as telas compartilham a mesma classificação.
    private IQueryable<ProdutoRankingAbc> RankingAbc(ObterIndicadoresConsulta consulta)
    {
        const decimal limiteClasseA = 0.80m;
        const decimal limiteClasseB = 0.95m;

        var intervalo = IntervaloUtc.De(consulta.DataInicio, consulta.DataFim);

        return context.Database.SqlQuery<ProdutoRankingAbc>($"""
            WITH vendidos AS (
                -- Faturamento por produto: vendas não canceladas no período, com os filtros do dashboard
                SELECT e.id_produto,
                       sum(i.quantidade) AS quantidade_vendida,
                       sum(i.preco_venda_real * i.quantidade) AS faturamento,
                       -- Preço de compra registrado no item, no momento da venda
                       sum(i.preco_compra * i.quantidade) AS cmv
                FROM item_venda i
                JOIN venda v ON v.id = i.id_venda
                JOIN estoque e ON e.id = i.id_estoque
                JOIN produto p ON p.id = e.id_produto
                LEFT JOIN cancelamento_venda c ON c.id_venda = v.id
                WHERE c.id IS NULL
                  AND v.data_venda >= {intervalo.Inicio}
                  AND v.data_venda < {intervalo.FimExclusivo}
                  AND ({consulta.IdRevendedora}::uuid IS NULL OR v.id_usuario = {consulta.IdRevendedora}::uuid)
                  AND ({consulta.IdTipoProduto}::int IS NULL OR p.id_tipo_produto = {consulta.IdTipoProduto}::int)
                GROUP BY e.id_produto
            ),
            com_estoque AS (
                -- Produtos com estoque disponível: com revendedora, só nas maletas dela; sem, no estoque geral e em todas as maletas.
                -- Valor a custo pelo preço de compra atual do produto
                SELECT e.id_produto,
                       sum(e.quantidade * p.preco_compra) AS valor_estoque
                FROM estoque e
                JOIN produto p ON p.id = e.id_produto
                LEFT JOIN maleta m ON m.id = e.id_maleta
                WHERE e.quantidade > 0
                  AND ({consulta.IdRevendedora}::uuid IS NULL OR m.id_usuario = {consulta.IdRevendedora}::uuid)
                  AND ({consulta.IdTipoProduto}::int IS NULL OR p.id_tipo_produto = {consulta.IdTipoProduto}::int)
                GROUP BY e.id_produto
            ),
            produtos AS (
                -- Vendidos e, com faturamento zero, os que têm estoque mas não venderam
                SELECT p.id,
                       p.descricao,
                       t.descricao AS categoria,
                       coalesce(vd.quantidade_vendida, 0)::int AS quantidade_vendida,
                       coalesce(vd.faturamento, 0) AS faturamento,
                       coalesce(vd.cmv, 0) AS cmv,
                       coalesce(ce.valor_estoque, 0) AS valor_estoque
                FROM vendidos vd
                FULL JOIN com_estoque ce ON ce.id_produto = vd.id_produto
                JOIN produto p ON p.id = coalesce(vd.id_produto, ce.id_produto)
                JOIN tipo_produto t ON t.id = p.id_tipo_produto
            ),
            ranking AS (
                -- Desempate por quantidade, nome e id, para o ranking não mudar entre requisições.
                -- Nome com collation ICU: a padrão do banco, na imagem Alpine (musl), compara por bytes e põe "Pérola" depois de "Ponto"
                SELECT *,
                       row_number() OVER ordem AS posicao,
                       sum(faturamento) OVER ordem AS acumulado,
                       sum(faturamento) OVER () AS faturamento_total,
                       count(*) OVER () AS total_produtos
                FROM produtos
                WINDOW ordem AS (ORDER BY faturamento DESC, quantidade_vendida DESC, descricao COLLATE "pt-BR-x-icu", id ROWS UNBOUNDED PRECEDING)
            ),
            classificados AS (
                -- A classe vem do acumulado antes do produto: quem faz o acumulado passar de um limite fica na classe desse limite
                SELECT *,
                       CASE
                           WHEN acumulado - faturamento < {limiteClasseA} * faturamento_total THEN 'A'
                           WHEN acumulado - faturamento < {limiteClasseB} * faturamento_total THEN 'B'
                           ELSE 'C'
                       END AS classe
                FROM ranking
            ),
            por_classe AS (
                SELECT *,
                       row_number() OVER (PARTITION BY classe ORDER BY posicao) AS ordem_na_classe,
                       row_number() OVER (PARTITION BY classe ORDER BY posicao DESC) AS ordem_inversa_na_classe,
                       count(*) OVER (PARTITION BY classe) AS quantidade_classe,
                       sum(faturamento) OVER (PARTITION BY classe) AS faturamento_classe
                FROM classificados
            )
            SELECT posicao::int AS posicao,
                   id AS id_produto,
                   descricao,
                   categoria,
                   quantidade_vendida,
                   round(faturamento, 2) AS faturamento,
                   classe,
                   -- Sem arredondar: quem usa arredonda conforme a exibição
                   posicao * 100.0 / total_produtos AS percentual_produtos,
                   coalesce(acumulado * 100 / nullif(faturamento_total, 0), 0) AS percentual_acumulado,
                   ordem_na_classe::int AS ordem_na_classe,
                   ordem_inversa_na_classe::int AS ordem_inversa_na_classe,
                   quantidade_classe::int AS quantidade_classe,
                   round(faturamento_classe, 2) AS faturamento_classe,
                   round(quantidade_classe * 100.0 / total_produtos, 1) AS percentual_mix_classe,
                   round(coalesce(faturamento_classe * 100 / nullif(faturamento_total, 0), 0), 1) AS percentual_faturamento_classe,
                   total_produtos::int AS total_produtos,
                   round(faturamento_total, 2) AS faturamento_total,
                   cmv,
                   valor_estoque
            FROM por_classe
            """);
    }

    // Base de todos os indicadores de venda: itens de vendas não canceladas que atendem aos filtros do dashboard
    private IQueryable<ItemVenda> ItensVendidos(ObterIndicadoresConsulta consulta)
    {
        var intervalo = IntervaloUtc.De(consulta.DataInicio, consulta.DataFim);

        return
            from item in context.ItensVenda.AsNoTracking()
            where item.Venda.Cancelamento == null
            where item.Venda.DataVenda >= intervalo.Inicio
            where item.Venda.DataVenda < intervalo.FimExclusivo
            where consulta.IdRevendedora == null || item.Venda.IdUsuario == consulta.IdRevendedora
            where consulta.IdTipoProduto == null || item.Estoque.Produto.IdTipoProduto == consulta.IdTipoProduto
            select item;
    }

    // Peças em estoque por faixa de idade, em uma única query: a última venda de cada produto num CTE e um GROUP BY pela faixa.
    // SQL escrito à mão porque o LINQ equivalente (LEFT JOIN com grupo e GROUP BY por um CASE) vira subqueries correlacionadas.
    // limitesFaixas: início (UTC) do dia mais antigo de cada faixa com venda, da mais recente para a mais antiga; venda anterior
    // ao último limite cai na faixa 4 (mais de 180 dias), e produto sem venda, na 5 (nunca vendido)
    public async Task<IList<PecasFaixaIdade>> ObterPecasPorFaixaIdadeAsync(ObterIdadeEstoqueConsulta consulta, IList<DateTime> limitesFaixas)
    {
        return await context.Database.SqlQuery<PecasFaixaIdade>($"""
            WITH ultimas_vendas AS (
                -- Última venda não cancelada de cada produto. Com revendedora, só as vendas dela, como o estoque (maletas dela)
                SELECT e.id_produto,
                       max(v.data_venda) AS ultima_venda
                FROM item_venda i
                JOIN venda v ON v.id = i.id_venda
                JOIN estoque e ON e.id = i.id_estoque
                LEFT JOIN cancelamento_venda c ON c.id_venda = v.id
                WHERE c.id IS NULL
                  AND ({consulta.IdRevendedora}::uuid IS NULL OR v.id_usuario = {consulta.IdRevendedora}::uuid)
                GROUP BY e.id_produto
            )
            -- Estoque disponível: com revendedora, só nas maletas dela; sem, no estoque geral e em todas as maletas.
            -- Valor a custo pelo preço de compra atual do produto
            SELECT CASE
                       WHEN uv.ultima_venda IS NULL THEN 5
                       WHEN uv.ultima_venda >= {limitesFaixas[0]} THEN 0
                       WHEN uv.ultima_venda >= {limitesFaixas[1]} THEN 1
                       WHEN uv.ultima_venda >= {limitesFaixas[2]} THEN 2
                       WHEN uv.ultima_venda >= {limitesFaixas[3]} THEN 3
                       ELSE 4
                   END AS faixa,
                   sum(e.quantidade)::int AS quantidade,
                   sum(e.quantidade * p.preco_compra) AS valor
            FROM estoque e
            JOIN produto p ON p.id = e.id_produto
            LEFT JOIN maleta m ON m.id = e.id_maleta
            LEFT JOIN ultimas_vendas uv ON uv.id_produto = e.id_produto
            WHERE e.quantidade > 0
              AND ({consulta.IdRevendedora}::uuid IS NULL OR m.id_usuario = {consulta.IdRevendedora}::uuid)
              AND ({consulta.IdTipoProduto}::int IS NULL OR p.id_tipo_produto = {consulta.IdTipoProduto}::int)
            GROUP BY 1
            """).ToListAsync();
    }
}
