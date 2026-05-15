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
        [FromQuery] List<Guid>? idsRevendedores = null,
        [FromQuery] List<int>? idsClientes = null,
        [FromQuery] List<int>? idsProdutos = null,
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
            IdsRevendedores = idsRevendedores ?? [],
            IdsClientes = idsClientes ?? [],
            IdsProdutos = idsProdutos ?? [],
            DataInicio = dataInicio,
            DataFim = dataFim,
            OrdenarPor = ordenarPor,
            OrdemDecrescente = ordemDecrescente,
        };

        var result = await vendaService.ListarAsync(query);
        return Ok(result.Valor);
    }
}
