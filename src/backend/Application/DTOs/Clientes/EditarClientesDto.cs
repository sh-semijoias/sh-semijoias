namespace ShSemijoias.Application.DTOs.Clientes;

public record EditarClientesDto(
    string Nome,
    string CPF,
    string Telefone,
    string Email
);
