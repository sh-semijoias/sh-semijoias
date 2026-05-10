using Microsoft.EntityFrameworkCore;
using ShSemijoias.Application.DTOs.Maletas;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;
using ShSemijoias.Infrastructure.Persistence;

namespace ShSemijoias.Infrastructure.Repositories;

public class MaletaRepository(ApplicationDbContext context) : IMaletaRepository
{
    public async Task<(IList<VisaoMaleta> Items, int Total)> ListarAsync(ListarMaletasConsulta query)
    {
        var grouped =
            from m in context.Maletas.Include(m => m.Usuario)
            join e in context.Estoques on m.Id equals e.IdMaleta into estoques
            from e in estoques.DefaultIfEmpty()
            where string.IsNullOrWhiteSpace(query.Busca) || EF.Functions.ILike(m.Descricao, $"%{query.Busca}%")
            group new { e } by m into g
            select new
            {
                Maleta = g.Key,
                TotalProdutos = g.Count(x => x.e != null && x.e.Quantidade > 0),
                TotalItens = g.Sum(x => x.e != null ? x.e.Quantidade : 0)
            };

        var total = await grouped.CountAsync();

        var ordenado = query.OrdenarPor switch
        {
            OrdenacaoMaleta.DataCadastro => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.Maleta.DataCadastro)
                : grouped.OrderBy(x => x.Maleta.DataCadastro),
            OrdenacaoMaleta.DataAtualizacao => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.Maleta.DataAtualizacao)
                : grouped.OrderBy(x => x.Maleta.DataAtualizacao),
            OrdenacaoMaleta.NomeUsuario => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.Maleta.Usuario.Nome)
                : grouped.OrderBy(x => x.Maleta.Usuario.Nome),
            OrdenacaoMaleta.TotalProdutos => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.TotalProdutos)
                : grouped.OrderBy(x => x.TotalProdutos),
            OrdenacaoMaleta.TotalItens => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.TotalItens)
                : grouped.OrderBy(x => x.TotalItens),
            _ => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.Maleta.Descricao)
                : grouped.OrderBy(x => x.Maleta.Descricao),
        };

        var items = await ordenado
            .Skip((query.Pagina - 1) * query.TamanhoPagina)
            .Take(query.TamanhoPagina)
            .ToListAsync();

        return (items.Select(x => new VisaoMaleta(x.Maleta, x.TotalProdutos, x.TotalItens)).ToList(), total);
    }
}
