using Microsoft.AspNetCore.Identity;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Repositories;

public class UsuarioRepository(UserManager<Usuario> userManager) : IUsuarioRepository
{
    public Task<IList<Usuario>> ListarAsync() =>
        Task.FromResult<IList<Usuario>>(userManager.Users.ToList());

    public Task<Usuario?> ObterPorIdAsync(Guid id) =>
        userManager.FindByIdAsync(id.ToString());

    public Task<Usuario?> ObterPorEmailAsync(string email) =>
        userManager.FindByEmailAsync(email);

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
}
