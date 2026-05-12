using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShSemijoias.Api.Extensions;
using ShSemijoias.Application.DTOs.Produtos;
using ShSemijoias.Application.Interfaces;

namespace ShSemijoias.Api.Controllers;

[ApiController]
[Route("api/produtos")]
[Authorize]
public class ProdutosController(IProdutoService produtoService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int pagina = 1, [FromQuery] int tamanhoPagina = 10)
    {
        var result = await produtoService.ListarAsync(pagina, tamanhoPagina);
        if (!result.Sucesso) return result.ToActionResult(this);
        return Ok(result.Valor);
    }

    [HttpGet("categorias")]
    public async Task<IActionResult> ListarCategorias()
    {
        var categorias = await produtoService.ListarCategoriasAsync();
        return Ok(categorias);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var dto = await produtoService.ObterPorIdAsync(id);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarProdutoDto dto)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var result = await produtoService.CriarAsync(dto, baseUrl);
        if (!result.Sucesso) return result.ToActionResult(this);
        return CreatedAtAction(nameof(ObterPorId), new { id = result.Valor!.IdProduto }, result.Valor);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Editar(int id, [FromBody] EditarProdutoDto dto)
    {
        var result = await produtoService.EditarAsync(id, dto);
        return result.Sucesso ? Ok(result.Valor) : result.ToActionResult(this);
    }
}
