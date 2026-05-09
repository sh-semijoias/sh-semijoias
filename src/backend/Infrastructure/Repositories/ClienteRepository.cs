using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;
using ShSemijoias.Infrastructure.Persistence;

namespace ShSemijoias.Infrastructure.Repositories;
public class ClienteRepository(ApplicationDbContext context) : IClienteRepository
{
    public async Task<(IList<Cliente> Items, int Total)> ListarAsync(int pagina, int tamanhoPagina)
    {
        var query = context.Clientes.OrderBy(c => c.Nome);

        var total = await query.CountAsync();
        var items = await query
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToListAsync();

        return (items, total);
    }

    public Task<Cliente?> ObterPorIdAsync(int id) =>
        context.Clientes.FindAsync(id).AsTask();

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
}