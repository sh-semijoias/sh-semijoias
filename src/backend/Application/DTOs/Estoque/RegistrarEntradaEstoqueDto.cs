namespace ShSemijoias.Application.DTOs.Estoque;

public record ItemEntradaDto(int IdProduto, int Quantidade);
public record RegistrarEntradaEstoqueDto(IList<ItemEntradaDto> Itens);
