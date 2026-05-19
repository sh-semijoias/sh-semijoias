namespace ShSemijoias.Application.DTOs.Auth;

public record LoginResponseDto(Guid UserId, string Email, string Name, string Role, bool PrecisaTrocarSenha);
