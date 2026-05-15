namespace ShSemijoias.Application.DTOs.Vendas;

public class ListarVendasConsulta
{
    public int Pagina { get; init; } = 1;
    public int TamanhoPagina { get; init; } = 10;
    public Guid? IdUsuario { get; init; }
    public Guid? IdRevendedora { get; init; }
    public int? IdCliente { get; init; }
    public int? IdProduto { get; init; }
    public DateTime? DataInicio { get; init; }
    public DateTime? DataFim { get; init; }
    public OrdenacaoVenda OrdenarPor { get; init; } = OrdenacaoVenda.DataVenda;
    public bool OrdemDecrescente { get; init; } = true;
}
