using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShSemijoias.Application.DTOs.Estoque;
using ShSemijoias.Application.Interfaces;

namespace ShSemijoias.Api.Controllers;

[ApiController]
[Route("api/estoque")]
[Authorize(Roles = "Administrador")]
public class EstoqueController(IEstoqueService estoqueService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar(
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanhoPagina = 10,
        [FromQuery] int? idProduto = null,
        [FromQuery] bool? emEstoque = null,
        [FromQuery] string? busca = null,
        [FromQuery] OrdenacaoEstoque ordenarPor = OrdenacaoEstoque.Produto,
        [FromQuery] bool ordemDecrescente = false)
    {
        var query = new ListarEstoqueConsulta(pagina, tamanhoPagina, idProduto, emEstoque, busca, ordenarPor, ordemDecrescente);
        var result = await estoqueService.ListarAsync(query);
        return Ok(result.Valor);
    }
}
