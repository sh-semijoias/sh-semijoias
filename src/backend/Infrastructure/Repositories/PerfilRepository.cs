using Microsoft.AspNetCore.Identity;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Infrastructure.Repositories;

public class PerfilRepository(RoleManager<Perfil> roleManager) : IPerfilRepository
{
    public Task<IList<Perfil>> ListarAsync() =>
        Task.FromResult<IList<Perfil>>(roleManager.Roles.ToList());

    public Task<bool> ExisteAsync(string nome) =>
        roleManager.RoleExistsAsync(nome);
}
