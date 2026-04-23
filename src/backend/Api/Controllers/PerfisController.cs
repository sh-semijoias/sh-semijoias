using Microsoft.AspNetCore.Mvc;
using ShSemijoias.Application.Interfaces;

namespace ShSemijoias.Api.Controllers;

[ApiController]
[Route("api/perfis")]
public class PerfisController(IPerfilService perfilService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar() =>
        Ok(await perfilService.ListarAsync());
}
