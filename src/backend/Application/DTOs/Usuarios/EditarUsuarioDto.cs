namespace ShSemijoias.Application.DTOs.Usuarios;

public record EditarUsuarioDto(
    string Nome,
    string Perfil,
    decimal? PercentualComissao
);
