using Microsoft.EntityFrameworkCore;
using ShSemijoias.Application.DTOs.Vendas;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;
using ShSemijoias.Infrastructure.Persistence;

namespace ShSemijoias.Infrastructure.Repositories;

public class VendaRepository(ApplicationDbContext context) : IVendaRepository
{
    public async Task<(IList<VisaoVenda> Items, int Total, decimal TotalVendasPeriodo)> ListarAsync(ListarVendasConsulta query)
    {
        IQueryable<int>? idsVendasComProduto = query.IdProduto != null
            ? context.ItensVenda
                .Where(i => i.Estoque.IdProduto == query.IdProduto)
                .Select(i => i.IdVenda)
            : null;

        var grouped =
            from venda in context.Vendas.AsNoTracking()
            join cliente in context.Clientes.AsNoTracking() on venda.IdCliente equals cliente.Id
            join usuario in context.Users.AsNoTracking() on venda.IdUsuario equals usuario.Id
            join tipoPagamento in context.TiposPagamento.AsNoTracking() on venda.IdTipoPagamento equals tipoPagamento.Id
            join item in context.ItensVenda on venda.Id equals item.IdVenda
            where query.IdUsuario == null || venda.IdUsuario == query.IdUsuario
            where query.IdRevendedora == null || venda.IdUsuario == query.IdRevendedora
            where query.IdCliente == null || venda.IdCliente == query.IdCliente
            where query.DataInicio == null || venda.DataVenda >= query.DataInicio
            where query.DataFim == null || venda.DataVenda <= query.DataFim
            where idsVendasComProduto == null || idsVendasComProduto.Contains(venda.Id)
            group new { item } by new
            {
                venda.Id,
                venda.DataVenda,
                NomeCliente = cliente.Nome,
                NomeRevendedora = usuario.Nome,
                FormaPagamento = tipoPagamento.Descricao
            } into g
            select new
            {
                g.Key.Id,
                g.Key.DataVenda,
                g.Key.NomeCliente,
                g.Key.NomeRevendedora,
                g.Key.FormaPagamento,
                TotalProdutos = g.Select(x => x.item.Estoque.IdProduto).Distinct().Count(),
                TotalItens = g.Sum(x => x.item.Quantidade),
                ValorTotal = g.Sum(x => x.item.PrecoVendaReal * x.item.Quantidade)
            };

        var total = await grouped.CountAsync();
        var totalVendasPeriodo = total > 0 ? await grouped.SumAsync(x => x.ValorTotal) : 0m;

        var ordenado = query.OrdenarPor switch
        {
            OrdenacaoVenda.NomeCliente => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.NomeCliente)
                : grouped.OrderBy(x => x.NomeCliente),
            OrdenacaoVenda.NomeRevendedora => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.NomeRevendedora)
                : grouped.OrderBy(x => x.NomeRevendedora),
            OrdenacaoVenda.ValorTotal => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.ValorTotal)
                : grouped.OrderBy(x => x.ValorTotal),
            _ => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.DataVenda)
                : grouped.OrderBy(x => x.DataVenda),
        };

        var items = await ordenado
            .Skip((query.Pagina - 1) * query.TamanhoPagina)
            .Take(query.TamanhoPagina)
            .ToListAsync();

        return (
            items.Select(x => new VisaoVenda(
                x.Id,
                x.DataVenda,
                x.NomeCliente,
                x.NomeRevendedora,
                x.TotalProdutos,
                x.TotalItens,
                x.ValorTotal,
                x.FormaPagamento
            )).ToList(),
            total,
            totalVendasPeriodo
        );
    }
}
