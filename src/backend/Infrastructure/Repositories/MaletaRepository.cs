using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using ShSemijoias.Application.DTOs.Maletas;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;
using ShSemijoias.Infrastructure.Persistence;

namespace ShSemijoias.Infrastructure.Repositories;

public class MaletaRepository(ApplicationDbContext context) : IMaletaRepository
{
    public async Task<Maleta?> ObterPorIdAsync(int id) =>
        await context.Maletas.Include(m => m.Usuario).FirstOrDefaultAsync(m => m.Id == id);

    public async Task<IList<Estoque>> ListarItensMaletaAsync(int idMaleta) =>
        await context.Estoques.Include(e => e.Produto).Where(e => e.IdMaleta == idMaleta).ToListAsync();

    public async Task<Maleta> AdicionarAsync(Maleta maleta)
    {
        await context.Maletas.AddAsync(maleta);
        return maleta;
    }

    public Task AtualizarAsync(Maleta maleta)
    {
        context.Maletas.Update(maleta);
        return Task.CompletedTask;
    }

    public async Task SalvarAsync() =>
        await context.SaveChangesAsync();

    public Task<IDbContextTransaction> BeginTransacaoAsync() =>
        context.Database.BeginTransactionAsync();

    public async Task<(IList<VisaoMaleta> Items, int Total)> ListarAsync(ListarMaletasConsulta query)
    {
        var grouped =
            from maleta in context.Maletas.AsNoTracking()
            join usuario in context.Users.AsNoTracking() on maleta.IdUsuario equals usuario.Id
            join estoque in context.Estoques on maleta.Id equals estoque.IdMaleta into estoqueJoin
            from estoque in estoqueJoin.DefaultIfEmpty()
            where query.IdUsuario == null || maleta.IdUsuario == query.IdUsuario
            where string.IsNullOrWhiteSpace(query.Busca) || EF.Functions.ILike(maleta.Descricao, $"%{query.Busca}%")
            group new { e=estoque } by new
            {
                maleta.Id,
                maleta.Descricao,
                maleta.DataCadastro,
                maleta.DataAtualizacao,
                maleta.IdUsuario,
                NomeUsuario = usuario.Nome
            } into g
            select new
            {
                g.Key.Id,
                g.Key.Descricao,
                g.Key.DataCadastro,
                g.Key.DataAtualizacao,
                g.Key.IdUsuario,
                g.Key.NomeUsuario,
                TotalProdutos = g.Count(x => x.e != null && x.e.Quantidade > 0),
                TotalItens = g.Sum(x => x.e != null ? x.e.Quantidade : 0)
            };

        var total = await grouped.CountAsync();

        var ordenado = query.OrdenarPor switch
        {
            OrdenacaoMaleta.DataCadastro => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.DataCadastro)
                : grouped.OrderBy(x => x.DataCadastro),
            OrdenacaoMaleta.DataAtualizacao => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.DataAtualizacao)
                : grouped.OrderBy(x => x.DataAtualizacao),
            OrdenacaoMaleta.NomeUsuario => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.NomeUsuario)
                : grouped.OrderBy(x => x.NomeUsuario),
            OrdenacaoMaleta.TotalProdutos => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.TotalProdutos)
                : grouped.OrderBy(x => x.TotalProdutos),
            OrdenacaoMaleta.TotalItens => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.TotalItens)
                : grouped.OrderBy(x => x.TotalItens),
            _ => query.OrdemDecrescente
                ? grouped.OrderByDescending(x => x.Descricao)
                : grouped.OrderBy(x => x.Descricao),
        };

        var items = await ordenado
            .Skip((query.Pagina - 1) * query.TamanhoPagina)
            .Take(query.TamanhoPagina)
            .ToListAsync();

        return (items.Select(x =>
        {
            var maleta = new Maleta
            {
                Id = x.Id,
                Descricao = x.Descricao,
                DataCadastro = x.DataCadastro,
                DataAtualizacao = x.DataAtualizacao,
                IdUsuario = x.IdUsuario,
                Usuario = new Usuario
                {
                    Id = x.IdUsuario,
                    Nome = x.NomeUsuario
                }
            };
            return new VisaoMaleta(maleta, x.TotalProdutos, x.TotalItens);
        }).ToList(), total);
    }
}
