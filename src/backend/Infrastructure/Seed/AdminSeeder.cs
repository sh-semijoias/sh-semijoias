using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ShSemijoias.Domain.Entities;
using ShSemijoias.Domain.Enums;

namespace ShSemijoias.Infrastructure.Seed;

public static class AdminSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<Usuario>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<Perfil>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger(nameof(AdminSeeder));

        const string emailAdmin = "admin@shsemijoias.com.br";
        const string senhaAdmin = "Admin@12345";

        foreach (var perfil in new[] { Perfis.Administrador, Perfis.Revendedor })
            if (!await roleManager.RoleExistsAsync(perfil))
                await roleManager.CreateAsync(new Perfil { Name = perfil });

        if (await userManager.FindByEmailAsync(emailAdmin) is null)
        {
            var admin = new Usuario
            {
                UserName = "admin",
                Email = emailAdmin,
                Nome = "Administrador",
                EmailConfirmed = true,
                DataCadastro = DateTime.UtcNow,
                DataAtualizacao = DateTime.UtcNow
            };
            var resultado = await userManager.CreateAsync(admin, senhaAdmin);
            if (resultado.Succeeded)
                await userManager.AddToRoleAsync(admin, Perfis.Administrador);
            else
                logger.LogError("Falha ao criar admin: {Erros}",
                    string.Join(", ", resultado.Errors.Select(e => e.Description)));
        }
    }
}
