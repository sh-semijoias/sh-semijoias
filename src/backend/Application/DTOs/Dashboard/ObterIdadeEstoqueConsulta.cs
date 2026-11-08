namespace ShSemijoias.Application.DTOs.Dashboard;

// Posição atual do estoque: não tem período, só os filtros de revendedora e categoria
public record ObterIdadeEstoqueConsulta(
    Guid? IdRevendedora = null,
    int? IdTipoProduto = null
);
