using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShSemijoias.Application.DTOs.Vendas;
using ShSemijoias.Application.Interfaces;

namespace ShSemijoias.Api.Controllers;

[ApiController]
[Route("api/vendas")]
[Authorize]
public class VendasController(IVendaService vendaService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanhoPagina = 10,
        [FromQuery] Guid? idRevendedora = null,
        [FromQuery] int? idCliente = null,
        [FromQuery] int? idProduto = null,
        [FromQuery] DateTime? dataInicio = null,
        [FromQuery] DateTime? dataFim = null,
        [FromQuery] OrdenacaoVenda ordenarPor = OrdenacaoVenda.DataVenda,
        [FromQuery] bool ordemDecrescente = true)
    {
        Guid? idUsuario = User.IsInRole("Administrador")
            ? null
            : Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var query = new ListarVendasConsulta
        {
            Pagina = pagina,
            TamanhoPagina = tamanhoPagina,
            IdUsuario = idUsuario,
            IdRevendedora = idRevendedora,
            IdCliente = idCliente,
            IdProduto = idProduto,
            DataInicio = dataInicio,
            DataFim = dataFim,
            OrdenarPor = ordenarPor,
            OrdemDecrescente = ordemDecrescente,
        };

        var result = await vendaService.ListarAsync(query);
        return Ok(result.Valor);
    }

    [HttpGet("formas-pagamento")]
    public async Task<IActionResult> ListarFormasPagamento()
    {
        var result = await vendaService.ListarFormasPagamentoAsync();
        return Ok(result.Valor);
    }
}
