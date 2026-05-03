using ShSemijoias.Application.Common;
using ShSemijoias.Application.Common.Validators;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Produtos;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Services;

public class ProdutoService(
    IProdutoRepository produtoRepository) : IProdutoService
{
    public async Task<Result<ListaPaginada<ProdutoDto>>> ListarAsync(int pagina, int tamanhoPagina)
    {
        var (produtos, total) = await produtoRepository.ListarAsync(pagina, tamanhoPagina);
        var dtos = new List<ProdutoDto>();

        foreach (var u in produtos)
        {
            var roles = await produtoRepository.ObterProdutosAsync(u);
            dtos.Add(new ProdutoDto(u.IdProduto, u.Data, u.Descricao, u.Tipo, u.PrecoCompra, u.PrecoVendaSugerido));
        }

        return Result<ListaPaginada<ProdutoDto>>.Ok(new ListaPaginada<ProdutoDto>(dtos, total, pagina, tamanhoPagina));
    }
    public async Task<ProdutoDto?> ObterPorIdAsync(Guid id)
    {
        var produto = await produtoRepository.ObterPorIdAsync(id);
        if (produto is null) return null;

        var roles = await produtoRepository.ObterProdutosAsync(produto);
        return new ProdutoDto(produto.IdProduto, produto.Data, produto.Descricao, produto.Tipo, produto.PrecoCompra, produto.PrecoVendaSugerido);
    }

    public async Task<Result<ProdutoDto>> CriarAsync(CriarProdutoDto dto, string baseUrl)
    {
        var erros = new List<string>();

        if (string.IsNullOrWhiteSpace(dto.Data)) erros.Add("Data é obrigatória.");
        if (string.IsNullOrWhiteSpace(dto.Descricao)) erros.Add("Descrição é obrigatória.");
        if (string.IsNullOrWhiteSpace(dto.Tipo)) erros.Add("Tipo é obrigatório.");
        if (string.IsNullOrWhiteSpace(dto.PrecoCompra)) erros.Add("Preço de compra é obrigatório.");
        if (string.IsNullOrWhiteSpace(dto.PrecoVendaSugerido)) erros.Add("Preço de venda sugerido é obrigatório.");

        if (erros.Count > 0) return Result<ProdutoDto>.Falha(erros);

        dto = dto with { Data = dto.Data.Trim(), Descricao = dto.Descricao.Trim(), Tipo = dto.Tipo.Trim(), PrecoCompra = dto.PrecoCompra.Trim(), PrecoVendaSugerido = dto.PrecoVendaSugerido.Trim() };

        if (erros.Count > 0) return Result<ProdutoDto>.Falha(erros, TipoErro.Conflito);

        var produto = new Produto
        {
            idProduto = dto.IdProduto,
            data = DateTime.UtcNow,
            descricao = dto.Descricao,
            tipo = dto.Tipo,
            PrecoCompra = dto.PrecoCompra,
            PrecoVendaSugerido = dto.PrecoVendaSugerido,

        };

        await produtoRepository.CriarAsync(produto);
        await produtoRepository.AdicionarPerfilAsync(produto, dto.Perfil);


        var roles = await produtoRepository.ObterProdutosAsync(produto);
        return Result<ProdutoDto>.Ok(new ProdutoDto(produto.Id, produto.Data, produto.descricao, produto.tipo, produto.PrecoCompra, produto.PrecoVendaSugerido));
    }

    public async Task<Result<ProdutoDto>> EditarAsync(Guid id, EditarProdutoDto dto)
    {
        var erros = new List<string>();

        if (string.IsNullOrWhiteSpace(dto.Data)) erros.Add("Data é obrigatória.");
        if (string.IsNullOrWhiteSpace(dto.Tipo)) erros.Add("Tipo é obrigatório.");
        if (string.IsNullOrWhiteSpace(dto.PrecoCompra)) erros.Add("Preço de compra é obrigatório.");
        if (string.IsNullOrWhiteSpace(dto.PrecoVendaSugerido)) erros.Add("Preço de venda sugerido é obrigatório.");

        if (erros.Count > 0) return Result<ProdutoDto>.Falha(erros);

        dto = dto with { Data = dto.Data.Trim(), Descricao = dto.Descricao.Trim(), Tipo = dto.Tipo.Trim(), PrecoCompra = dto.PrecoCompra.Trim(), PrecoVendaSugerido = dto.PrecoVendaSugerido.Trim() };

        var produto = await produtoRepository.ObterPorIdAsync(id);
        if (produto is null)
            return Result<ProdutoDto>.Falha("Usuário não encontrado.", TipoErro.NaoEncontrado);

        if (erros.Count > 0) return Result<ProdutoDto>.Falha(erros, TipoErro.Conflito);

        produto.Data = dto.Data;
        produto.Descricao = dto.Descricao;
        produto.Tipo = dto.Tipo;
        produto.PrecoCompra = dto.PrecoCompra;
        produto.PrecoVendaSugerido = dto.PrecoVendaSugerido;
        produto.DataAtualizacao = DateTime.UtcNow;

        var rolesAtuais = await produtoRepository.ObterProdutosAsync(produto);
        var perfilAtual = rolesAtuais.FirstOrDefault();

        await produtoRepository.AtualizarAsync(produto);

        var roles = await produtoRepository.ObterProdutosAsync(produto);
        return Result<ProdutoDto>.Ok(new ProdutoDto(produto.Id, produto.Data, produto.Descricao, produto.Tipo, produto.PrecoCompra, produto.PrecoVendaSugerido));
    }
}
