using Microsoft.AspNetCore.Identity;
using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Auth;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Services;

public class AuthService(
    SignInManager<Usuario> signInManager,
    UserManager<Usuario> userManager) : IAuthService
{
    private const string InvalidCredentialsMessage = "E-mail ou senha inválidos.";

    public async Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user is null)
            return Result<LoginResponseDto>.Falha(InvalidCredentialsMessage, TipoErro.NaoAutorizado);

        var signInResult = await signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!signInResult.Succeeded)
            return Result<LoginResponseDto>.Falha(InvalidCredentialsMessage, TipoErro.NaoAutorizado);

        await signInManager.SignInAsync(user, isPersistent: true);
        var roles = await userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? string.Empty;

        return Result<LoginResponseDto>.Ok(new LoginResponseDto(
            user.Id,
            user.Email ?? string.Empty,
            user.Nome,
            role));
    }

    public Task LogoutAsync() => signInManager.SignOutAsync();
}
