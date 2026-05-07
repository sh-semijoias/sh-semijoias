using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShSemijoias.Api.Extensions;
using ShSemijoias.Application.DTOs.Clientes;
using ShSemijoias.Application.Interfaces;

namespace ShSemijoias.Api.Controllers;

[ApiController]
[Route("api/clientes")]
[Authorize]
public class ClientesController(IClienteService clienteService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int pagina = 1, [FromQuery] int tamanhoPagina = 10)
    {
        var result = await clienteService.ListarAsync(pagina, tamanhoPagina);
        if (!result.Sucesso) return result.ToActionResult(this);
        return Ok(result.Valor);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var dto = await clienteService.ObterPorIdAsync(id);
        return dto is null ? NotFound() : Ok(dto);
        }
    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarClientesDto dto)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var result = await clienteService.CriarAsync(dto, baseUrl);

        if (!result.Sucesso)
            return result.ToActionResult(this);

        return CreatedAtAction(
            nameof(ObterPorId),
            new { id = result.Valor!.Id },
            result.Valor
        );
    }
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Editar(int id, [FromBody] EditarClientesDto dto)
    {
        var result = await clienteService.EditarAsync(id, dto);
        return result.Sucesso ? Ok(result.Valor) : result.ToActionResult(this);
    }
}
