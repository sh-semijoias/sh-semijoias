using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Usuarios;

namespace ShSemijoias.Application.Interfaces;

public interface IUsuarioService
{
    Task<IList<UsuarioDto>> ListarAsync();
    Task<UsuarioDto?> ObterPorIdAsync(Guid id);
    Task<Result<UsuarioDto>> CriarAsync(CriarUsuarioDto dto, string baseUrl);
    Task<Result<UsuarioDto>> EditarAsync(Guid id, EditarUsuarioDto dto);
}
