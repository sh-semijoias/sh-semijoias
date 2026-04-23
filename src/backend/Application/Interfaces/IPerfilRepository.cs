using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Interfaces;

public interface IPerfilRepository
{
    Task<IList<Perfil>> ListarAsync();
    Task<bool> ExisteAsync(string nome);
}
