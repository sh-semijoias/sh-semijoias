using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Estoque;

namespace ShSemijoias.Application.Interfaces;

public interface IEstoqueService
{
    Task<Result<ListaPaginada<EstoqueDto>>> ListarAsync(ListarEstoqueConsulta query, Guid idUsuario, bool isAdmin);
    Task<Result<bool>> RegistrarEntradaAsync(RegistrarEntradaEstoqueDto dto);
    Task<Result<bool>> AtualizarQuantidadeAsync(int idEstoque, AtualizarQuantidadeEstoqueDto dto);
    Task<Result<ListaPaginada<ProdutoResumidoDto>>> ListarProdutosAsync(ListarProdutosConsulta consulta);
}
