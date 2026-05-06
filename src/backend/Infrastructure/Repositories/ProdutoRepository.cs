using Microsoft.EntityFrameworkCore;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;
using ShSemijoias.Infrastructure.Persistence;

namespace ShSemijoias.Infrastructure.Repositories;

public class ProdutoRepository(ApplicationDbContext context) : IProdutoRepository
{
    public async Task<(IList<Produto> Items, int Total)> ListarAsync(int pagina, int tamanhoPagina)
    {
        var query = context.Produtos
            .AsNoTracking()
            .Include(p => p.TipoProduto)
            .OrderBy(p => p.Descricao);
        var total = await query.CountAsync();
        var items = await query
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToListAsync();
        return (items, total);
    }

    public Task<Produto?> ObterPorIdAsync(int id) =>
        context.Produtos
            .Include(p => p.TipoProduto)
            .FirstOrDefaultAsync(p => p.Id == id);

    public Task<bool> CategoriaExisteAsync(int idCategoria) =>
        context.TiposProduto
            .AsNoTracking()
            .AnyAsync(t => t.Id == idCategoria);

    public async Task<IReadOnlyList<TipoProduto>> ListarCategoriasAsync() =>
        await context.TiposProduto
            .AsNoTracking()
            .OrderBy(t => t.Descricao)
            .ToListAsync();

    public async Task CriarAsync(Produto produto)
    {
        context.Produtos.Add(produto);
        await context.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Produto produto)
    {
        context.Produtos.Update(produto);
        await context.SaveChangesAsync();
    }
}
