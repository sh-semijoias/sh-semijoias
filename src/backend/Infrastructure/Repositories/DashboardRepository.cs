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

    public async Task<decimal> ObterValorEstoqueAtualAsync(
    ObterIndicadoresConsulta consulta)
    {
        return await context.Estoques
            .Where(e =>
                consulta.IdTipoProduto == null ||
                e.Produto.IdTipoProduto == consulta.IdTipoProduto)
            .SumAsync(e =>
                (decimal?)(e.Quantidade * e.Produto.PrecoCompra))
            ?? 0m;
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

    public async Task<PecasSemGiroDto> ObterPecasSemGiroAsync()
    {
        var limite = DateTime.UtcNow.AddDays(-90);

        var produtosSemGiro =
            from estoque in context.Estoques
            let ultimaVenda =
                context.ItensVenda
                    .Where(i => i.Estoque.IdProduto == estoque.IdProduto)
                    .Max(i => (DateTime?)i.Venda.DataVenda)
            where ultimaVenda == null || ultimaVenda < limite
            select new
            {
                estoque.Quantidade,
                Valor = estoque.Quantidade * estoque.Produto.PrecoCompra
            };

        var quantidade = await produtosSemGiro.SumAsync(x => (int?)x.Quantidade) ?? 0;

        var valor = await produtosSemGiro.SumAsync(x => (decimal?)x.Valor) ?? 0m;

        return new PecasSemGiroDto(
            quantidade,
            valor);
    }
}
