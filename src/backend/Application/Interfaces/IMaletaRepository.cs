using ShSemijoias.Application.DTOs.Maletas;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Interfaces;

public interface IMaletaRepository
{
    Task<(IList<VisaoMaleta> Items, int Total)> ListarAsync(ListarMaletasConsulta query);
}
