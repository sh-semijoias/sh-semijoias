using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShSemijoias.Api.Extensions;
using ShSemijoias.Application.DTOs.Dashboard;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Enums;

namespace ShSemijoias.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = Perfis.Administrador)]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet("ticket-medio")]
    public async Task<IActionResult> ObterTicketMedio([FromQuery] ObterIndicadoresConsulta consulta)
    {
        var result = await dashboardService.ObterTicketMedioAsync(consulta);
        return result.Sucesso ? Ok(result.Valor) : result.ToActionResult(this);
    }

    [HttpGet("ticket-medio-mensal")]
    public async Task<IActionResult> ObterTicketMedioMensal([FromQuery] ObterTicketMedioMensalConsulta consulta)
    {
        var result = await dashboardService.ObterTicketMedioMensalAsync(consulta);
        return result.Sucesso ? Ok(result.Valor) : result.ToActionResult(this);
    }

    [HttpGet("margem-bruta")]
    public async Task<IActionResult> ObterMargemBruta(
        [FromQuery] ObterIndicadoresConsulta consulta)
    {
        var result = await dashboardService.ObterMargemBrutaAsync(consulta);

        return result.Sucesso
            ? Ok(result.Valor)
            : result.ToActionResult(this);
    }

    [HttpGet("dias-estoque")]
    public async Task<IActionResult> ObterDiasEstoque(
        [FromQuery] ObterIndicadoresConsulta consulta)
    {
        var result =
            await dashboardService
                .ObterDiasEstoqueAsync(consulta);

        return result.Sucesso
            ? Ok(result.Valor)
            : result.ToActionResult(this);
    }

    [HttpGet("pecas-sem-giro")]
    public async Task<IActionResult> ObterPecasSemGiro()
    {
        var result =
            await dashboardService.ObterPecasSemGiroAsync();

        return result.Sucesso
            ? Ok(result.Valor)
            : result.ToActionResult(this);
    }

    [HttpGet("curva-abc")]
    public async Task<IActionResult> ObterCurvaAbc([FromQuery] ObterIndicadoresConsulta consulta)
    {
        var result = await dashboardService.ObterCurvaAbcAsync(consulta);
        return result.Sucesso ? Ok(result.Valor) : result.ToActionResult(this);
    }

    [HttpGet("produtos-abc")]
    public async Task<IActionResult> ListarProdutosAbc([FromQuery] ListarProdutosAbcConsulta consulta)
    {
        var result = await dashboardService.ListarProdutosAbcAsync(consulta);
        return result.Sucesso ? Ok(result.Valor) : result.ToActionResult(this);
    }

    [HttpGet("faturamento-clientes")]
    public async Task<IActionResult> ListarFaturamentoClientes([FromQuery] ListarFaturamentoClientesConsulta consulta)
    {
        var result = await dashboardService.ListarFaturamentoClientesAsync(consulta);
        return result.Sucesso ? Ok(result.Valor) : result.ToActionResult(this);
    }
}
