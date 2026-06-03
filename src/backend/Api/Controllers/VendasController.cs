using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShSemijoias.Api.Extensions;
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
        [FromQuery] bool ordemDecrescente = true,
        [FromQuery] bool? cancelada = null)
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
            Cancelada = cancelada,
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

    [HttpGet("motivos-cancelamento")]
    public async Task<IActionResult> ListarMotivosCancelamento()
    {
        var result = await vendaService.ListarMotivosCancelamentoAsync();
        return Ok(result.Valor);
    }

[HttpPost]
public async Task<IActionResult> Criar([FromBody] CriarVendaDto dto)
{
    Console.WriteLine($"DTO.IdUsuario recebido: {dto.IdUsuario}");

    var isAdmin = User.IsInRole("Administrador");
    var idUsuario = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    var result = await vendaService.CriarAsync(dto, idUsuario, isAdmin);

    return result.Sucesso
        ? CreatedAtAction(nameof(Listar), new { }, result.Valor)
        : result.ToActionResult(this);
}

    [HttpGet("{id:int}/parcelas")]
    public async Task<IActionResult> ListarParcelas(int id)
    {
        var isAdmin = User.IsInRole("Administrador");

        var result = await vendaService.ListarParcelasAsync(id, isAdmin);
        return result.Sucesso ? Ok(result.Valor) : result.ToActionResult(this);
    }

    [HttpPost("{id:int}/parcelas/pagamento")]
    public async Task<IActionResult> RegistrarPagamento(int id, [FromBody] RegistrarPagamentoDto dto)
    {
        var isAdmin = User.IsInRole("Administrador");

        var result = await vendaService.RegistrarPagamentoAsync(id, dto, isAdmin);
        return result.Sucesso ? NoContent() : result.ToActionResult(this);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Cancelar(int id, [FromBody] CancelarVendaDto dto)
    {
        var isAdmin = User.IsInRole("Administrador");
        var idUsuario = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await vendaService.CancelarAsync(id, dto, idUsuario, isAdmin);
        return result.Sucesso ? NoContent() : result.ToActionResult(this);
    }
}
