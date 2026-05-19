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

        return Result<LoginResponseDto>.Ok(ToDto(user, roles));
    }

    public Task LogoutAsync() => signInManager.SignOutAsync();

    public async Task<Result<LoginResponseDto>> TrocarSenhaAsync(Guid userId, TrocarSenhaDto dto)
    {
        if (dto.NovaSenha != dto.ConfirmacaoNovaSenha)
            return Result<LoginResponseDto>.Falha("A nova senha e a confirmação não coincidem.");

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null)
            return Result<LoginResponseDto>.Falha("Usuário não encontrado.", TipoErro.NaoEncontrado);

        IdentityResult resultado;
        if (!string.IsNullOrEmpty(dto.SenhaAtual))
        {
            resultado = await userManager.ChangePasswordAsync(user, dto.SenhaAtual, dto.NovaSenha);
            if (!resultado.Succeeded)
                return Result<LoginResponseDto>.Falha("Senha atual incorreta.");
        }
        else
        {
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            resultado = await userManager.ResetPasswordAsync(user, token, dto.NovaSenha);
            if (!resultado.Succeeded)
                return Result<LoginResponseDto>.Falha(resultado.Errors.Select(e => e.Description).ToList());
        }

        user.SenhaProvisoriaAtiva = false;
        user.DataAtualizacao = DateTime.UtcNow;
        await userManager.UpdateAsync(user);

        var roles = await userManager.GetRolesAsync(user);
        return Result<LoginResponseDto>.Ok(ToDto(user, roles));
    }

    private static LoginResponseDto ToDto(Usuario user, IList<string> roles) =>
        new(user.Id, user.Email ?? string.Empty, user.Nome, roles.FirstOrDefault() ?? string.Empty, user.SenhaProvisoriaAtiva);
}
