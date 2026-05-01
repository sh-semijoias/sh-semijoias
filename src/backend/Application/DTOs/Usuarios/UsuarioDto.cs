namespace ShSemijoias.Application.DTOs.Usuarios;

public record UsuarioDto(
    Guid Id,
    string Nome,
    string Email,
    string Perfil,
    string? Telefone  // nullable: usuários existentes no banco podem não ter telefone
);
