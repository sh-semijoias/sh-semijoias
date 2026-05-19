namespace ShSemijoias.Application.DTOs.Clientes;

public record ClientesDto(
    int Id,
    string Nome,
    string Email,
    string CPF,
    string Telefone,
    string UsuarioNome
);
