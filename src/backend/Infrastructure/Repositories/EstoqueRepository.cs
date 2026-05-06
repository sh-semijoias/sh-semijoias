using Microsoft.EntityFrameworkCore;
using ShSemijoias.Application.DTOs.Estoque;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Infrastructure.Persistence;

namespace ShSemijoias.Infrastructure.Repositories;

public class EstoqueRepository(ApplicationDbContext context) : IEstoqueRepository
{
    public async Task<(IList<EstoqueDto> Items, int Total)> ListarAsync(ListarEstoqueConsulta query)
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
            OrdenacaoEstoque.Categoria  => query.OrdemDecrescente
                ? dbQuery.OrderByDescending(e => e.Produto.TipoProduto.Descricao)
                : dbQuery.OrderBy(e => e.Produto.TipoProduto.Descricao),
            OrdenacaoEstoque.Quantidade => query.OrdemDecrescente
                ? dbQuery.OrderByDescending(e => e.Quantidade)
                : dbQuery.OrderBy(e => e.Quantidade),
            _                           => query.OrdemDecrescente
                ? dbQuery.OrderByDescending(e => e.Produto.Descricao)
                : dbQuery.OrderBy(e => e.Produto.Descricao),
        };

        var items = await itemsOrdenados
            .Skip((query.Pagina - 1) * query.TamanhoPagina)
            .Take(query.TamanhoPagina)
            .Select(e => new EstoqueDto(
                e.Id,
                e.IdProduto,
                e.Produto.Descricao,
                e.Produto.IdTipoProduto,
                e.Produto.TipoProduto.Descricao,
                e.Quantidade,
                e.Produto.PrecoCompra,
                e.Produto.PrecoVendaSugerido
            ))
            .ToListAsync();

        return (items, total);
    }
}
