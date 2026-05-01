using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ShSemijoias.Api.Extensions;
using ShSemijoias.Application.DTOs.Auth;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;
using System.Security.Claims;

namespace ShSemijoias.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService, UserManager<Usuario> userManager) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        var result = await authService.LoginAsync(dto);
        return result.Sucesso ? Ok(result.Valor) : result.ToActionResult(this);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await authService.LogoutAsync();
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userId, out var parsedId))
            return Unauthorized();

        var user = await userManager.FindByIdAsync(userId!);
        if (user is null)
            return Unauthorized();

        var roles = await userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? string.Empty;

        return Ok(new LoginResponseDto(parsedId, user.Email ?? string.Empty, user.Nome, role));
    }
}
