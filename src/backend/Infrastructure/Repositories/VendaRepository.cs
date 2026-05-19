using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using ShSemijoias.Application.DTOs.Vendas;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;
using ShSemijoias.Infrastructure.Persistence;

namespace ShSemijoias.Infrastructure.Repositories;

public class VendaRepository(ApplicationDbContext context) : IVendaRepository
{
    public async Task<(IList<VisaoVenda> Items, int Total, decimal TotalVendasPeriodo, decimal TotalRecebidoPeriodo)> ListarAsync(ListarVendasConsulta query)
    {
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
            where query.IdProduto == null || venda.Itens.Any(i => i.Estoque.IdProduto == query.IdProduto)
            group new { item } by new
            {
                venda.Id,
                venda.DataVenda,
                venda.IdUsuario,
                venda.TotalParcelas,
                NomeCliente = cliente.Nome,
                NomeRevendedora = usuario.Nome,
                FormaPagamento = tipoPagamento.Descricao,
                DataCancelamento = venda.Cancelamento == null ? (DateTime?)null : venda.Cancelamento.DataCancelamento,
                NomeMotivoCancelamento = venda.Cancelamento == null ? null : venda.Cancelamento.MotivoCancelamentoVenda.Nome
            } into g
            select new
            {
                g.Key.Id,
                g.Key.DataVenda,
                g.Key.IdUsuario,
                g.Key.NomeCliente,
                g.Key.NomeRevendedora,
                g.Key.TotalParcelas,
                g.Key.FormaPagamento,
                g.Key.DataCancelamento,
                g.Key.NomeMotivoCancelamento,
                TotalItens = g.Sum(x => x.item.Quantidade),
                ValorTotal = g.Sum(x => x.item.PrecoVendaReal * x.item.Quantidade),
                ValorRecebido = context.RecebimentosParcela
                    .Where(r => r.Parcela.IdVenda == g.Key.Id)
                    .Sum(r => (decimal?)r.ValorRecebido) ?? 0m
            };

        if (query.Cancelada == true)
            grouped = grouped.Where(x => x.DataCancelamento != null);
        else if (query.Cancelada == false)
            grouped = grouped.Where(x => x.DataCancelamento == null);

        var total = await grouped.CountAsync();
        var totalVendasPeriodo = await grouped.SumAsync(x => (decimal?)x.ValorTotal) ?? 0m;
        var totalRecebidoPeriodo = await grouped.SumAsync(x => (decimal?)x.ValorRecebido) ?? 0m;

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
                x.IdUsuario,
                x.NomeRevendedora,
                x.TotalItens,
                x.TotalParcelas,
                x.ValorTotal,
                x.FormaPagamento,
                x.DataCancelamento,
                x.NomeMotivoCancelamento,
                x.ValorRecebido
            )).ToList(),
            total,
            totalVendasPeriodo,
            totalRecebidoPeriodo
        );
    }

    public async Task<IReadOnlyList<Parcela>> ListarParcelasComRecebimentoAsync(int idVenda) =>
        await context.Parcelas
            .AsNoTracking()
            .Include(p => p.Recebimento)
            .Where(p => p.IdVenda == idVenda)
            .OrderBy(p => p.NumeroParcela)
            .ToListAsync();

    public Task<Parcela?> ObterParcelaParaPagamentoAsync(int idParcela) =>
        context.Parcelas
            .Include(p => p.Venda).ThenInclude(v => v.Cancelamento)
            .Include(p => p.Recebimento)
            .FirstOrDefaultAsync(p => p.Id == idParcela);

    public async Task AdicionarRecebimentoAsync(RecebimentoParcela recebimento) =>
        await context.RecebimentosParcela.AddAsync(recebimento);

    public async Task<IReadOnlyList<TipoPagamento>> ListarFormasPagamentoAtivasAsync() =>
        await context.TiposPagamento
            .AsNoTracking()
            .Where(t => t.Ativo)
            .OrderBy(t => t.Descricao)
            .ToListAsync();

    public Task<TipoPagamento?> ObterTipoPagamentoAsync(int idTipoPagamento) =>
        context.TiposPagamento.FirstOrDefaultAsync(t => t.Id == idTipoPagamento);

    public Task<Venda?> ObterPorIdAsync(int id) =>
        context.Vendas
            .Include(v => v.Itens).ThenInclude(i => i.Estoque)
            .Include(v => v.Cancelamento)
            .FirstOrDefaultAsync(v => v.Id == id);

    public async Task<IReadOnlyList<MotivoCancelamentoVenda>> ListarMotivosCancelamentoAsync() =>
        await context.MotivosCancelamentoVenda
            .AsNoTracking()
            .OrderBy(m => m.Id)
            .ToListAsync();

    public async Task AdicionarCancelamentoAsync(CancelamentoVenda cancelamento) =>
        await context.CancelamentosVenda.AddAsync(cancelamento);

    public async Task<Venda> CriarAsync(Venda venda)
    {
        await context.Vendas.AddAsync(venda);
        return venda;
    }

    public async Task SalvarAsync() =>
        await context.SaveChangesAsync();

    public Task<IDbContextTransaction> BeginTransacaoAsync() =>
        context.Database.BeginTransactionAsync();
}
