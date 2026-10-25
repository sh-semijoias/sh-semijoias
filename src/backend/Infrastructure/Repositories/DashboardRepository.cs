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

    // Base de todos os indicadores de venda: itens de vendas não canceladas que atendem aos filtros do dashboard
    private IQueryable<ItemVenda> ItensVendidos(ObterIndicadoresConsulta consulta)
    {
        var intervalo = IntervaloUtc.De(consulta.DataInicio, consulta.DataFim);

        return
            from item in context.ItensVenda.AsNoTracking()
            join venda in context.Vendas.AsNoTracking() on item.IdVenda equals venda.Id
            join estoque in context.Estoques.AsNoTracking() on item.IdEstoque equals estoque.Id
            join produto in context.Produtos.AsNoTracking() on estoque.IdProduto equals produto.Id
            where venda.Cancelamento == null
            where venda.DataVenda >= intervalo.Inicio
            where venda.DataVenda < intervalo.FimExclusivo
            where consulta.IdRevendedora == null || venda.IdUsuario == consulta.IdRevendedora
            where consulta.IdTipoProduto == null || produto.IdTipoProduto == consulta.IdTipoProduto
            select item;
    }
}
