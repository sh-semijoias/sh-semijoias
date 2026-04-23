using ShSemijoias.Application.DTOs.Perfis;

namespace ShSemijoias.Application.Interfaces;

public interface IPerfilService
{
    Task<IList<PerfilDto>> ListarAsync();
}
