using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShSemijoias.Api.Extensions;
using ShSemijoias.Application.DTOs.Usuarios;
using ShSemijoias.Application.Interfaces;

namespace ShSemijoias.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize]
public class UsuariosController(IUsuarioService usuarioService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanhoPagina = 10,
        [FromQuery] string? perfil = null)
    {
        var result = await usuarioService.ListarAsync(pagina, tamanhoPagina, perfil);
        if (!result.Sucesso) return result.ToActionResult(this);
        return Ok(result.Valor);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterPorId(Guid id)
    {
        var dto = await usuarioService.ObterPorIdAsync(id);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarUsuarioDto dto)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var result = await usuarioService.CriarAsync(dto, baseUrl);
        if (!result.Sucesso) return result.ToActionResult(this);
        return CreatedAtAction(nameof(ObterPorId), new { id = result.Valor!.Id }, result.Valor);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Editar(Guid id, [FromBody] EditarUsuarioDto dto)
    {
        var result = await usuarioService.EditarAsync(id, dto);
        return result.Sucesso ? Ok(result.Valor) : result.ToActionResult(this);
    }
}
