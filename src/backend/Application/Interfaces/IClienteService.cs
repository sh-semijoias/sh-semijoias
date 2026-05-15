using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Clientes;

namespace ShSemijoias.Application.Interfaces;

public interface IClienteService
{
    Task<Result<ListaPaginada<ClientesDto>>> ListarAsync(int pagina, int tamanhoPagina, string? busca = null);
    Task<ClientesDto?> ObterPorIdAsync(int id);
    Task<Result<ClientesDto>> CriarAsync(CriarClientesDto dto, string baseUrl);
    Task<Result<ClientesDto>> EditarAsync(int id, EditarClientesDto dto);
}
