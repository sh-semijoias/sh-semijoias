namespace ShSemijoias.Application.DTOs.Usuarios;

public record CriarUsuarioDto(
    string Nome,
    string Email,
    string Perfil,
    string Telefone
);
