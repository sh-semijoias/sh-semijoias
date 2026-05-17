using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using ShSemijoias.Application.Interfaces;

namespace ShSemijoias.Api.Common;

public class UserContext(IHttpContextAccessor httpContextAccessor)
    : IUserContext
{
    public Guid UsuarioId
    {
        get
        {
            var id = httpContextAccessor
                .HttpContext?
                .User?
                .FindFirst(ClaimTypes.NameIdentifier)?
                .Value;

            return Guid.Parse(id!);
        }
    }

    public bool IsAdmin =>
        httpContextAccessor
            .HttpContext?
            .User?
            .IsInRole("Administrador") ?? false;
}