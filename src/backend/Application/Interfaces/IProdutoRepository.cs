using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Interfaces;

public interface IProdutoRepository
{
    Task<(IList<Produto> Items, int Total)> ListarAsync(int pagina, int tamanhoPagina);
    Task<Produto?> ObterPorIdAsync(Guid id);
    Task<IList<string>> ObterProdutosAsync(Produto produto);
    Task CriarAsync(Produto produto);
    Task AtualizarAsync(Produto produto);
}

