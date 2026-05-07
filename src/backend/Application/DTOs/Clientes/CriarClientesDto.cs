namespace ShSemijoias.Application.DTOs.Clientes;

public record CriarClientesDto(
    string Nome,
    string Email,
    string CPF,
    string Telefone
);
