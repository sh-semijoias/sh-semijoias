using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Produtos;

namespace ShSemijoias.Application.Interfaces;

public interface IProdutoService
{
    Task<Result<ListaPaginada<ProdutoDto>>> ListarAsync(int pagina, int tamanhoPagina);
    Task<ProdutoDto?> ObterPorIdAsync(Guid id);
    Task<Result<ProdutoDto>> CriarAsync(CriarProdutoDto dto, string baseUrl);
    Task<Result<ProdutoDto>> EditarAsync(Guid id, EditarProdutoDto dto);
}
