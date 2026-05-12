using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShSemijoias.Application.DTOs.Maletas;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Api.Extensions;


namespace ShSemijoias.Api.Controllers;

[ApiController]
[Route("api/maletas")]
[Authorize]
public class MaletasController(IMaletaService maletaService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanhoPagina = 10,
        [FromQuery] string? busca = null,
        [FromQuery] OrdenacaoMaleta ordenarPor = OrdenacaoMaleta.Descricao,
        [FromQuery] bool ordemDecrescente = false)
    {
        Guid? idUsuario = User.IsInRole("Administrador")
            ? null
            : Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var query = new ListarMaletasConsulta(pagina, tamanhoPagina, busca, idUsuario, ordenarPor, ordemDecrescente);
        var result = await maletaService.ListarAsync(query);
        return Ok(result.Valor);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        Guid? idUsuario = User.IsInRole("Administrador")
            ? null
            : Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await maletaService.ObterPorIdAsync(id, idUsuario);
        return result.Sucesso ? Ok(result.Valor) : result.ToActionResult(this);
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Criar([FromBody] CriarEditarMaletaDto dto)
    {
        var result = await maletaService.CriarAsync(dto);
        return result.Sucesso ? Ok(result.Valor) : result.ToActionResult(this);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Editar(int id, [FromBody] CriarEditarMaletaDto dto)
    {
        var result = await maletaService.EditarAsync(id, dto);
        return result.Sucesso ? Ok(result.Valor) : result.ToActionResult(this);
    }
}
