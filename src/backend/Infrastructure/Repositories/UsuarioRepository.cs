using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;
using ShSemijoias.Infrastructure.Persistence;

namespace ShSemijoias.Infrastructure.Repositories;

public class UsuarioRepository(UserManager<Usuario> userManager, ApplicationDbContext context) : IUsuarioRepository
{
    public async Task<(IList<Usuario> Items, int Total)> ListarAsync(int pagina, int tamanhoPagina, string? perfil = null, string? busca = null)
    {
        var query = context.Users
            .Include(u => u.Perfis)
            .Where(u => perfil == null || u.Perfis.Any(p => p.NormalizedName == perfil.ToUpper()))
            .Where(u => string.IsNullOrWhiteSpace(busca) || EF.Functions.ILike(u.Nome, $"%{busca}%"))
            .OrderBy(u => u.Nome);

        var total = await query.CountAsync();
        var items = await query
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToListAsync();

        return (items, total);
    }

    public Task<Usuario?> ObterPorIdAsync(Guid id) =>
        userManager.FindByIdAsync(id.ToString());

    public Task<Usuario?> ObterPorEmailAsync(string email) =>
        userManager.FindByEmailAsync(email);

    public Task<Usuario?> ObterPorTelefoneAsync(string telefone) =>
        userManager.Users.FirstOrDefaultAsync(u => u.PhoneNumber == telefone);

    public async Task<IList<string>> ObterPerfisAsync(Usuario usuario) =>
        await userManager.GetRolesAsync(usuario);

    public async Task CriarAsync(Usuario usuario)
    {
        var resultado = await userManager.CreateAsync(usuario);
        if (!resultado.Succeeded)
            throw new InvalidOperationException(string.Join(", ", resultado.Errors.Select(e => e.Description)));
    }

    public async Task AdicionarPerfilAsync(Usuario usuario, string perfil)
    {
        var resultado = await userManager.AddToRoleAsync(usuario, perfil);
        if (!resultado.Succeeded)
            throw new InvalidOperationException(string.Join(", ", resultado.Errors.Select(e => e.Description)));
    }

    public async Task RemoverPerfilAsync(Usuario usuario, string perfil)
    {
        var resultado = await userManager.RemoveFromRoleAsync(usuario, perfil);
        if (!resultado.Succeeded)
            throw new InvalidOperationException(string.Join(", ", resultado.Errors.Select(e => e.Description)));
    }

    public async Task AtualizarAsync(Usuario usuario)
    {
        var resultado = await userManager.UpdateAsync(usuario);
        if (!resultado.Succeeded)
            throw new InvalidOperationException(string.Join(", ", resultado.Errors.Select(e => e.Description)));
    }

    public Task<string> GerarTokenResetSenhaAsync(Usuario usuario) =>
        userManager.GeneratePasswordResetTokenAsync(usuario);

    public async Task DefinirSenhaAsync(Usuario usuario, string senha)
    {
        var token = await userManager.GeneratePasswordResetTokenAsync(usuario);
        var resultado = await userManager.ResetPasswordAsync(usuario, token, senha);
        if (!resultado.Succeeded)
            throw new InvalidOperationException(string.Join(", ", resultado.Errors.Select(e => e.Description)));
    }

    public async Task<IList<Usuario>> ListarPorPerfilAsync(string perfil) =>
        await userManager.GetUsersInRoleAsync(perfil);
}
