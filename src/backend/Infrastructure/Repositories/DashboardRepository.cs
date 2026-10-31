using Microsoft.EntityFrameworkCore;
using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Dashboard;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;
using ShSemijoias.Infrastructure.Persistence;

namespace ShSemijoias.Infrastructure.Repositories;

public class DashboardRepository(ApplicationDbContext context) : IDashboardRepository
{
    public async Task<ResumoVendasPeriodo> ObterResumoVendasAsync(ObterIndicadoresConsulta consulta)
    {
        var itens = ItensVendidos(consulta);

        var faturamento = await itens.SumAsync(i => (decimal?)(i.PrecoVendaReal * i.Quantidade)) ?? 0m;
        var quantidadeVendas = await itens.Select(i => i.IdVenda).Distinct().CountAsync();

        return new ResumoVendasPeriodo(faturamento, quantidadeVendas);
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

    // Curva do dashboard: do ranking completo, só os destaques de cada classe, o último produto de cada classe (cortes)
    // e uma amostra de pontos. O resultado tem tamanho fixo, qualquer que seja o catálogo.
    public async Task<IList<LinhaCurvaAbc>> ObterCurvaAbcAsync(ObterIndicadoresConsulta consulta)
    {
        const int produtosPorClasse = 5;
        // Acima disso, a curva vem amostrada (um ponto a cada N produtos); abaixo, um ponto por produto
        const int pontosCurva = 200;

        return await (
            from produto in RankingAbc(consulta)
            // Destaques: os de maior faturamento nas classes A e B; na C, os de menor, do menor para o maior
            let ordemDestaque = produto.Classe == "C" ? produto.OrdemInversaNaClasse : produto.OrdemNaClasse
            let destaque = ordemDestaque <= produtosPorClasse
            let ultimoDaClasse = produto.OrdemInversaNaClasse == 1
            // Passo da amostragem: divisão inteira arredondada para cima
            let passo = (produto.TotalProdutos + pontosCurva - 1) / pontosCurva
            where destaque || ultimoDaClasse || produto.Posicao % passo == 0
            orderby produto.Posicao
            select new LinhaCurvaAbc(
                produto.Posicao,
                produto.Descricao,
                produto.Categoria,
                produto.QuantidadeVendida,
                produto.Faturamento,
                produto.Classe,
                // round() do PostgreSQL arredonda numeric para longe do zero no empate, como o resto da API
                Math.Round(produto.PercentualProdutos, 2),
                Math.Round(produto.PercentualAcumulado, 2),
                Math.Round(produto.PercentualAcumulado, 1),
                destaque,
                ordemDestaque,
                ultimoDaClasse,
                produto.QuantidadeClasse,
                produto.FaturamentoClasse,
                produto.PercentualMixClasse,
                produto.PercentualFaturamentoClasse,
                produto.TotalProdutos,
                produto.FaturamentoTotal)
        ).ToListAsync();
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
                       sum(i.preco_venda_real * i.quantidade) AS faturamento
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
                -- Produtos com estoque disponível: com revendedora, só nas maletas dela; sem, no estoque geral e em todas as maletas
                SELECT DISTINCT e.id_produto
                FROM estoque e
                JOIN produto p ON p.id = e.id_produto
                LEFT JOIN maleta m ON m.id = e.id_maleta
                WHERE e.quantidade > 0
                  AND ({consulta.IdRevendedora}::uuid IS NULL OR m.id_usuario = {consulta.IdRevendedora}::uuid)
                  AND ({consulta.IdTipoProduto}::int IS NULL OR p.id_tipo_produto = {consulta.IdTipoProduto}::int)
            ),
            produtos AS (
                -- Vendidos e, com faturamento zero, os que têm estoque mas não venderam
                SELECT p.id,
                       p.descricao,
                       t.descricao AS categoria,
                       coalesce(vd.quantidade_vendida, 0)::int AS quantidade_vendida,
                       coalesce(vd.faturamento, 0) AS faturamento
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
                   round(faturamento_total, 2) AS faturamento_total
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
}
