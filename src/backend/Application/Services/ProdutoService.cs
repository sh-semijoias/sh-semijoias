using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Produtos;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Services;

public class ProdutoService(
    IProdutoRepository produtoRepository) : IProdutoService
{
    private static ProdutoDto ToDto(Produto produto) =>
        new(
            produto.Id,
            produto.DataCadastro,
            produto.Descricao,
            produto.TipoProduto.Descricao,
            produto.PrecoCompra,
            produto.PrecoVendaSugerido);

    public async Task<Result<ListaPaginada<ProdutoDto>>> ListarAsync(int pagina, int tamanhoPagina)
    {
        var (produtos, total) = await produtoRepository.ListarAsync(pagina, tamanhoPagina);
        var dtos = produtos.Select(ToDto).ToList();
        return Result<ListaPaginada<ProdutoDto>>.Ok(new ListaPaginada<ProdutoDto>(dtos, total, pagina, tamanhoPagina));
    }

    public async Task<IReadOnlyList<CategoriaProdutoDto>> ListarCategoriasAsync()
    {
        var categorias = await produtoRepository.ListarCategoriasAsync();
        return categorias.Select(categoria => new CategoriaProdutoDto(categoria.Id, categoria.Descricao)).ToList();
    }

    public async Task<ProdutoDto?> ObterPorIdAsync(int id)
    {
        var produto = await produtoRepository.ObterPorIdAsync(id);
        return produto is null ? null : ToDto(produto);
    }

    public async Task<Result<ProdutoDto>> CriarAsync(CriarProdutoDto dto, string baseUrl)
    {
        var erros = new List<string>();

        if (string.IsNullOrWhiteSpace(dto.Data)) erros.Add("Data é obrigatória.");
        if (string.IsNullOrWhiteSpace(dto.Descricao)) erros.Add("Descrição é obrigatória.");
        if (dto.IdCategoria <= 0) erros.Add("Categoria é obrigatória.");

        if (erros.Count > 0) return Result<ProdutoDto>.Falha(erros);

        var existeCategoria = await produtoRepository.CategoriaExisteAsync(dto.IdCategoria);
        if (!existeCategoria)
            return Result<ProdutoDto>.Falha("Categoria não encontrada.");

        var produto = new Produto
        {
            Descricao = dto.Descricao.Trim(),
            IdTipoProduto = dto.IdCategoria,
            PrecoCompra = dto.PrecoCompra,
            PrecoVendaSugerido = dto.PrecoVendaSugerido,
            DataCadastro = DateTime.UtcNow,
            DataAtualizacao = DateTime.UtcNow
        };

        await produtoRepository.CriarAsync(produto);

        var atualizado = await produtoRepository.ObterPorIdAsync(produto.Id);
        return Result<ProdutoDto>.Ok(ToDto(atualizado!));
    }

    public async Task<Result<ProdutoDto>> EditarAsync(int id, EditarProdutoDto dto)
    {
        var erros = new List<string>();

        if (dto.IdCategoria <= 0) erros.Add("Categoria é obrigatória.");

        if (erros.Count > 0) return Result<ProdutoDto>.Falha(erros);

        dto = dto with { Descricao = dto.Descricao.Trim(), IdCategoria = dto.IdCategoria, PrecoCompra = dto.PrecoCompra, PrecoVendaSugerido = dto.PrecoVendaSugerido };

        var existeCategoria = await produtoRepository.CategoriaExisteAsync(dto.IdCategoria);
        if (!existeCategoria)
            return Result<ProdutoDto>.Falha("Categoria não encontrada.");

        var produto = await produtoRepository.ObterPorIdAsync(id);
        if (produto is null)
            return Result<ProdutoDto>.Falha("Produto não encontrado.", TipoErro.NaoEncontrado);

        produto.Descricao = dto.Descricao;
        produto.IdTipoProduto = dto.IdCategoria;
        produto.PrecoCompra = dto.PrecoCompra;
        produto.PrecoVendaSugerido = dto.PrecoVendaSugerido;
        produto.DataAtualizacao = DateTime.UtcNow;

        await produtoRepository.AtualizarAsync(produto);

        var atualizado = await produtoRepository.ObterPorIdAsync(id);
        return Result<ProdutoDto>.Ok(ToDto(atualizado!));
    }
}
