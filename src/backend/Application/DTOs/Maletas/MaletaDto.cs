namespace ShSemijoias.Application.DTOs.Maletas;

public record MaletaDto(
    int Id,
    string Descricao,
    string NomeUsuario,
    int TotalProdutos,
    int TotalItens,
    DateTime DataCadastro,
    DateTime DataAtualizacao
);
