using ShSemijoias.Application.DTOs.Perfis;
using ShSemijoias.Application.Interfaces;

namespace ShSemijoias.Application.Services;

public class PerfilService(IPerfilRepository perfilRepository) : IPerfilService
{
    public async Task<IList<PerfilDto>> ListarAsync()
    {
        var perfis = await perfilRepository.ListarAsync();
        return perfis
            .OrderBy(p => p.Name)
            .Select(p => new PerfilDto(p.Id, p.Name!))
            .ToList();
    }
}
