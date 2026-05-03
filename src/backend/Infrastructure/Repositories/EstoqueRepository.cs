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

        var items = await dbQuery
            .OrderBy(e => e.Produto.Descricao)
            .Skip((query.Pagina - 1) * query.TamanhoPagina)
            .Take(query.TamanhoPagina)
            .Select(e => new EstoqueDto(
                e.Id,
                e.IdProduto,
                e.Produto.Descricao,
                e.Produto.IdTipoProduto,
                e.Produto.TipoProduto.Descricao,
                e.Quantidade
            ))
            .ToListAsync();

        return (items, total);
    }
}
