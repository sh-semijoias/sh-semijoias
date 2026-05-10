using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShSemijoias.Application.DTOs.Maletas;
using ShSemijoias.Application.Interfaces;

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
        var query = new ListarMaletasConsulta(pagina, tamanhoPagina, busca, ordenarPor, ordemDecrescente);
        var result = await maletaService.ListarAsync(query);
        return Ok(result.Valor);
    }
}
