using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Maletas;

namespace ShSemijoias.Application.Interfaces;

public interface IMaletaService
{
    Task<Result<ListaPaginada<MaletaDto>>> ListarAsync(ListarMaletasConsulta query);
}
