namespace ShSemijoias.Application.DTOs.Usuarios;

public record UsuarioDto(
    Guid Id,
    string Nome,
    string Email,
    string Perfil,
    string? Telefone,
    bool SenhaProvisoriaAtiva
);
