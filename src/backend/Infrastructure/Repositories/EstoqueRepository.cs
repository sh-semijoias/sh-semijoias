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
            .Where(e => e.IdMaleta == null)
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
            OrdenacaoEstoque.Categoria          => query.OrdemDecrescente
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

    public async Task<Estoque?> BuscarPorProdutoAsync(int idProduto) =>
        await context.Estoques
            .FirstOrDefaultAsync(e => e.IdProduto == idProduto && e.IdMaleta == null);

    public async Task AdicionarAsync(Estoque estoque) =>
        await context.Estoques.AddAsync(estoque);

    public async Task SalvarAsync() =>
        await context.SaveChangesAsync();

    public async Task<IList<Produto>> ListarProdutosAsync() =>
        await context.Produtos
            .OrderBy(p => p.Descricao)
            .ToListAsync();
}
