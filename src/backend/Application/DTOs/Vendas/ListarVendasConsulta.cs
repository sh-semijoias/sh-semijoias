namespace ShSemijoias.Application.DTOs.Vendas;

public record ListarVendasConsulta(
    int Pagina,
    int TamanhoPagina,
    Guid? IdUsuario,
    Guid? IdRevendedora,
    string? NomeCliente,
    string? NomeProduto,
    DateTime? DataInicio,
    DateTime? DataFim,
    OrdenacaoVenda OrdenarPor = OrdenacaoVenda.DataVenda,
    bool OrdemDecrescente = true
);
