using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShSemijoias.Api.Extensions;
using ShSemijoias.Application.DTOs.Estoque;
using ShSemijoias.Application.Interfaces;

namespace ShSemijoias.Api.Controllers;

[ApiController]
[Route("api/estoque")]
[Authorize]
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
        var isAdmin = User.IsInRole("Administrador");
        var idUsuario = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var query = new ListarEstoqueConsulta(pagina, tamanhoPagina, idProduto, emEstoque, busca, ordenarPor, ordemDecrescente);
        var result = await estoqueService.ListarAsync(query, idUsuario, isAdmin);
        if (!result.Sucesso) return result.ToActionResult(this);
        return Ok(result.Valor);
    }

    [HttpGet("produtos")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ListarProdutos(
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanhoPagina = 10,
        [FromQuery] string? busca = null)
    {
        var result = await estoqueService.ListarProdutosAsync(new ListarProdutosConsulta(pagina, tamanhoPagina, busca));
        return Ok(result.Valor);
    }

    [HttpPut("{id:int}/quantidade")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> AtualizarQuantidade(int id, [FromBody] AtualizarQuantidadeEstoqueDto dto)
    {
        var result = await estoqueService.AtualizarQuantidadeAsync(id, dto);
        if (!result.Sucesso) return result.ToActionResult(this);
        return NoContent();
    }

    [HttpPost("entrada")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> RegistrarEntrada([FromBody] RegistrarEntradaEstoqueDto dto)
    {
        var result = await estoqueService.RegistrarEntradaAsync(dto);
        if (!result.Sucesso) return result.ToActionResult(this);
        return NoContent();
    }
}
