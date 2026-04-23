using Microsoft.AspNetCore.Mvc;
using ShSemijoias.Application.Common;

namespace ShSemijoias.Api.Extensions;

public static class ResultExtensions
{
    public static IActionResult ToActionResult<T>(this Result<T> result, ControllerBase controller) =>
        result.TipoErro switch
        {
            TipoErro.Conflito      => controller.Conflict(new { Erros = result.Erros }),
            TipoErro.NaoEncontrado => controller.NotFound(),
            _                      => controller.BadRequest(new { Erros = result.Erros }),
        };
}
