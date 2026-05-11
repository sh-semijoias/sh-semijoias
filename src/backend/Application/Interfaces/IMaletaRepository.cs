using ShSemijoias.Application.DTOs.Maletas;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Interfaces;

public interface IMaletaRepository
{
    Task<(IList<VisaoMaleta> Items, int Total)> ListarAsync(ListarMaletasConsulta query);
    Task<Maleta?> ObterPorIdAsync(int id);
    Task<IList<Estoque>> ListarItensMaletaAsync(int idMaleta);
    Task<Maleta> AdicionarAsync(Maleta maleta);
    Task AtualizarAsync(Maleta maleta);
    Task SalvarAsync();
}
