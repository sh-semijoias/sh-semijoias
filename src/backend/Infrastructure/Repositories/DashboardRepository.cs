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

    public async Task<IList<FaturamentoProduto>> ObterFaturamentoPorProdutoAsync(ObterIndicadoresConsulta consulta)
    {
        var vendidos = await (
            from item in ItensVendidos(consulta)
            group item by new
            {
                item.Estoque.IdProduto,
                item.Estoque.Produto.Descricao,
                Categoria = item.Estoque.Produto.TipoProduto.Descricao
            } into produto
            select new FaturamentoProduto(
                produto.Key.IdProduto,
                produto.Key.Descricao,
                produto.Key.Categoria,
                produto.Sum(i => i.Quantidade),
                produto.Sum(i => i.PrecoVendaReal * i.Quantidade))
        ).ToListAsync();

        var idsVendidos = vendidos.Select(p => p.IdProduto).ToList();

        // Produtos com estoque disponível e sem venda no período entram com faturamento zero.
        // Com revendedora, só o estoque das maletas dela; sem, o estoque geral e todas as maletas.
        var semVenda = await (
            from estoque in context.Estoques.AsNoTracking()
            where estoque.Quantidade > 0
            where !idsVendidos.Contains(estoque.IdProduto)
            where consulta.IdRevendedora == null || estoque.Maleta!.IdUsuario == consulta.IdRevendedora
            where consulta.IdTipoProduto == null || estoque.Produto.IdTipoProduto == consulta.IdTipoProduto
            select new
            {
                estoque.IdProduto,
                estoque.Produto.Descricao,
                Categoria = estoque.Produto.TipoProduto.Descricao
            }
        ).Distinct().ToListAsync();

        return [.. vendidos, .. semVenda.Select(p => new FaturamentoProduto(p.IdProduto, p.Descricao, p.Categoria, 0, 0m))];
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
