using Microsoft.EntityFrameworkCore;
using ShSemijoias.Application.DTOs.Estoque;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;
using ShSemijoias.Infrastructure.Persistence;

namespace ShSemijoias.Infrastructure.Repositories;

public class EstoqueRepository(ApplicationDbContext context) : IEstoqueRepository
{
    public async Task<(IList<Estoque> Items, int Total)> ListarAsync(ListarEstoqueConsulta query)
    {
        var dbQuery = context.Estoques
            .Where(e => e.IdMaleta == query.IdMaleta)
            .Include(e => e.Produto)
                .ThenInclude(p => p.TipoProduto)
            .AsQueryable();

        if (query.IdProduto.HasValue)
            dbQuery = dbQuery.Where(e => e.IdProduto == query.IdProduto.Value);

        if (query.EmEstoque.HasValue)
        {
            dbQuery = query.EmEstoque.Value
                ? dbQuery.Where(e => e.Quantidade > 0)
                : dbQuery.Where(e => e.Quantidade == 0);
        }

        if (!string.IsNullOrWhiteSpace(query.Busca))
            dbQuery = dbQuery.Where(e => EF.Functions.ILike(e.Produto.Descricao, $"%{query.Busca}%"));

        var total = await dbQuery.CountAsync();

        var itemsOrdenados = query.OrdenarPor switch
        {
            OrdenacaoEstoque.Tipo               => query.OrdemDecrescente
                ? dbQuery.OrderByDescending(e => e.Produto.TipoProduto.Descricao)
                : dbQuery.OrderBy(e => e.Produto.TipoProduto.Descricao),
            OrdenacaoEstoque.Quantidade         => query.OrdemDecrescente
                ? dbQuery.OrderByDescending(e => e.Quantidade)
                : dbQuery.OrderBy(e => e.Quantidade),
            OrdenacaoEstoque.PrecoCompra        => query.OrdemDecrescente
                ? dbQuery.OrderByDescending(e => e.Produto.PrecoCompra)
                : dbQuery.OrderBy(e => e.Produto.PrecoCompra),
            OrdenacaoEstoque.PrecoVendaSugerido => query.OrdemDecrescente
                ? dbQuery.OrderByDescending(e => e.Produto.PrecoVendaSugerido)
                : dbQuery.OrderBy(e => e.Produto.PrecoVendaSugerido),
            _                                   => query.OrdemDecrescente
                ? dbQuery.OrderByDescending(e => e.Produto.Descricao)
                : dbQuery.OrderBy(e => e.Produto.Descricao),
        };

        var items = await itemsOrdenados
            .Skip((query.Pagina - 1) * query.TamanhoPagina)
            .Take(query.TamanhoPagina)
            .ToListAsync();

        return (items, total);
    }

    public async Task<Estoque?> BuscarPorIdAsync(int id) =>
        await context.Estoques.FirstOrDefaultAsync(e => e.Id == id);

    public async Task<Estoque?> BuscarPorProdutoAsync(int idProduto, int? idMaleta = null) =>
        await context.Estoques
            .FirstOrDefaultAsync(e => e.IdProduto == idProduto && e.IdMaleta == idMaleta);

    public async Task<Dictionary<int, Estoque>> BuscarPorProdutosAsync(IList<int> idsProdutos, int? idMaleta = null) =>
        await context.Estoques
            .Where(e => idsProdutos.Contains(e.IdProduto) && e.IdMaleta == idMaleta)
            .ToDictionaryAsync(e => e.IdProduto);

    public async Task<Dictionary<int, Estoque>> BuscarPorIdsAsync(IList<int> ids, int? idMaleta = null) =>
        await context.Estoques
            .Where(e => ids.Contains(e.Id) && e.IdMaleta == idMaleta)
            .ToDictionaryAsync(e => e.Id);

    public async Task AdicionarAsync(Estoque estoque) =>
        await context.Estoques.AddAsync(estoque);

    public Task RemoverAsync(Estoque estoque)
    {
        context.Estoques.Remove(estoque);
        return Task.CompletedTask;
    }

    public async Task SalvarAsync() =>
        await context.SaveChangesAsync();

    public async Task<(IList<Estoque> Items, int Total)> ListarProdutosAsync(ListarProdutosConsulta consulta)
    {
        var baseQuery =
            from p in context.Produtos
            join e in context.Estoques.Where(e => e.IdMaleta == null)
                on p.Id equals e.IdProduto into estGroup
            from e in estGroup.DefaultIfEmpty()
            select new { Produto = p, Quantidade = e == null ? 0 : e.Quantidade };

        if (!string.IsNullOrWhiteSpace(consulta.Busca))
            baseQuery = baseQuery.Where(x => EF.Functions.ILike(x.Produto.Descricao, $"%{consulta.Busca}%"));

        var total = await baseQuery.CountAsync();

        var raw = await baseQuery
            .OrderBy(x => x.Produto.Descricao)
            .Skip((consulta.Pagina - 1) * consulta.TamanhoPagina)
            .Take(consulta.TamanhoPagina)
            .ToListAsync();

        var items = raw
            .Select(x => new Estoque { IdProduto = x.Produto.Id, Produto = x.Produto, Quantidade = x.Quantidade })
            .ToList();

        return (items, total);
    }

}
