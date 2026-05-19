using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Usuarios;

namespace ShSemijoias.Application.Interfaces;

public interface IUsuarioService
{
    Task<Result<ListaPaginada<UsuarioDto>>> ListarAsync(int pagina, int tamanhoPagina, string? perfil = null, string? busca = null);
    Task<UsuarioDto?> ObterPorIdAsync(Guid id);
    Task<Result<CriarUsuarioResponseDto>> CriarAsync(CriarUsuarioDto dto);
    Task<Result<UsuarioDto>> EditarAsync(Guid id, EditarUsuarioDto dto);
    Task<Result<ResetarSenhaProvisoriaResponseDto>> ResetarSenhaProvisoriaAsync(Guid id);
}
