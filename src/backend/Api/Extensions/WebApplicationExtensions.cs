using Microsoft.EntityFrameworkCore;
using ShSemijoias.Infrastructure.Persistence;
using ShSemijoias.Infrastructure.Seed;

namespace ShSemijoias.Api.Extensions;

public static class WebApplicationExtensions
{
    public static async Task MigrateAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.MigrateAsync();
    }

    public static Task SeedAdminAsync(this WebApplication app) =>
        AdminSeeder.SeedAsync(app.Services);
}
