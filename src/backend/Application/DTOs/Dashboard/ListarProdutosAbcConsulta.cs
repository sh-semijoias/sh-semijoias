namespace ShSemijoias.Application.DTOs.Dashboard;

// Classe: "A", "B" ou "C"; validada no serviço, com os outros erros
public record ListarProdutosAbcConsulta(
    DateOnly DataInicio,
    DateOnly DataFim,
    Guid? IdRevendedora = null,
    int? IdTipoProduto = null,
    string? Classe = null,
    int Pagina = 1,
    int TamanhoPagina = 5
)
{
    public ObterIndicadoresConsulta Indicadores() => new(DataInicio, DataFim, IdRevendedora, IdTipoProduto);
}
