using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Auth;

namespace ShSemijoias.Application.Interfaces;

public interface IAuthService
{
    Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto dto);
    Task LogoutAsync();
    Task<Result<LoginResponseDto>> TrocarSenhaAsync(Guid userId, TrocarSenhaDto dto);
}
