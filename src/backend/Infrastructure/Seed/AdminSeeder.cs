using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using ShSemijoias.Domain.Entities;

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

        const string perfilAdmin = "Administrador";
        const string emailAdmin = "admin@shsemijoias.com.br";
        const string senhaAdmin = "Admin@12345";

        if (!await roleManager.RoleExistsAsync(perfilAdmin))
            await roleManager.CreateAsync(new Perfil { Name = perfilAdmin });

        if (await userManager.FindByEmailAsync(emailAdmin) is null)
        {
            var admin = new Usuario
            {
                UserName = "admin",
                Email = emailAdmin,
                EmailConfirmed = true
            };
            var resultado = await userManager.CreateAsync(admin, senhaAdmin);
            if (resultado.Succeeded)
                await userManager.AddToRoleAsync(admin, perfilAdmin);
            else
                logger.LogError("Falha ao criar admin: {Erros}",
                    string.Join(", ", resultado.Errors.Select(e => e.Description)));
        }
    }
}
