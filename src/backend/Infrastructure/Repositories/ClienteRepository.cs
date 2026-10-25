using Microsoft.AspNetCore.Identity;

using Microsoft.EntityFrameworkCore;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

using ShSemijoias.Infrastructure.Persistence;

namespace ShSemijoias.Infrastructure.Repositories;
public class ClienteRepository(ApplicationDbContext context) : IClienteRepository
{
    public async Task<(IList<Cliente> Items, int Total)> ListarAsync(int pagina, int tamanhoPagina, string? busca = null)
    {
        var query = context.Clientes
            .Include(x => x.Usuario)
            .AsQueryable();
        if (!string.IsNullOrWhiteSpace(busca))
        {
            query = query.Where(c => EF.Functions.ILike(c.Nome, $"%{busca}%"));
        }

        var ordenado = query.OrderBy(c => c.Nome);

        var total = await ordenado.CountAsync();
        var items = await ordenado
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToListAsync();

        return (items, total);
    }

    public Task<Cliente?> ObterPorIdAsync(int id) =>
    context.Clientes
        .Include(x => x.Usuario)
        .FirstOrDefaultAsync(x => x.Id == id);

    public Task<Cliente?> ObterPorEmailAsync(string email) =>
        context.Clientes.FirstOrDefaultAsync(c => c.Email == email);

    public Task<Cliente?> ObterPorTelefoneAsync(string telefone) =>
        context.Clientes.FirstOrDefaultAsync(c => c.Telefone == telefone);

    public async Task CriarAsync(Cliente cliente)
    {
        context.Clientes.Add(cliente);
        await context.SaveChangesAsync();
    }

    public async Task AtualizarAsync(Cliente cliente)
    {
        context.Clientes.Update(cliente);
        await context.SaveChangesAsync();
    }

    public async Task<(IEnumerable<Cliente>, int)> ListarPorUsuarioAsync(
    Guid usuarioId,
    int pagina,
    int tamanhoPagina,
    string? busca = null)
{
    var query = context.Clientes
        .Include(x => x.Usuario)
        .Where(x => x.UsuarioId == usuarioId);

    if (!string.IsNullOrWhiteSpace(busca))
    {
        query = query.Where(x =>
            EF.Functions.ILike(x.Nome, $"%{busca}%"));
    }

    var total = await query.CountAsync();

    var clientes = await query
        .OrderBy(x => x.Nome)
        .Skip((pagina - 1) * tamanhoPagina)
        .Take(tamanhoPagina)
        .ToListAsync();

    return (clientes, total);
}
}