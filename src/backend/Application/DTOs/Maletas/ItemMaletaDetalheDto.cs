namespace ShSemijoias.Application.DTOs.Maletas;

public record ItemMaletaDetalheDto(
    int IdEstoque,
    int IdProduto,
    string Descricao,
    int Quantidade,
    int QuantidadeGeral);
