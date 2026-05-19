namespace ShSemijoias.Application.DTOs.Usuarios;

public record CriarUsuarioResponseDto(Guid Id, string Nome, string Email, string Perfil, string? Telefone, string SenhaProvisoria);
