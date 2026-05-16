using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Estoque;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Services;

public class EstoqueService(
    IEstoqueRepository estoqueRepository,
    IMaletaRepository maletaRepository) : IEstoqueService
{
    public async Task<Result<ListaPaginada<EstoqueDto>>> ListarAsync(ListarEstoqueConsulta query, Guid idUsuario, bool isAdmin)
    {
        // Escopo derivado do usuário logado: admin vê o estoque central;
        // revendedor vê apenas a própria maleta. Qualquer IdMaleta vindo do
        // cliente é ignorado.
        int? idMaleta = null;
        if (!isAdmin)
        {
            var maleta = await maletaRepository.ObterPorUsuarioAsync(idUsuario);
            if (maleta is null)
                return Result<ListaPaginada<EstoqueDto>>.Falha("Revendedor não possui maleta ativa.");
            idMaleta = maleta.Id;
        }

        query = query with { IdMaleta = idMaleta };

        var (items, total) = await estoqueRepository.ListarAsync(query);
        var dtos = items.Select(e => new EstoqueDto(
            e.Id,
            e.IdProduto,
            e.Produto.Descricao,
            e.Produto.IdTipoProduto,
            e.Produto.TipoProduto.Descricao,
            e.Quantidade,
            isAdmin ? e.Produto.PrecoCompra : 0m,
            e.Produto.PrecoVendaSugerido
        )).ToList();
        return Result<ListaPaginada<EstoqueDto>>.Ok(
            new ListaPaginada<EstoqueDto>(dtos, total, query.Pagina, query.TamanhoPagina));
    }

    public async Task<Result<bool>> RegistrarEntradaAsync(RegistrarEntradaEstoqueDto dto)
    {
        var erros = new List<string>();

        if (dto.Itens == null || dto.Itens.Count == 0)
            return Result<bool>.Falha("Informe ao menos um item.");

        if (dto.Itens.Any(i => i.Quantidade <= 0))
            erros.Add("A quantidade de cada item deve ser maior que zero.");

        if (dto.Itens.GroupBy(i => i.IdProduto).Any(g => g.Count() > 1))
            erros.Add("Não é permitido informar o mesmo produto mais de uma vez.");

        if (erros.Count > 0)
            return Result<bool>.Falha(erros);

        foreach (var item in dto.Itens)
        {
            var estoque = await estoqueRepository.BuscarPorProdutoAsync(item.IdProduto);
            if (estoque is not null)
            {
                estoque.Quantidade += item.Quantidade;
                estoque.DataAtualizacao = DateTime.UtcNow;
            }
            else
            {
                await estoqueRepository.AdicionarAsync(new Estoque
                {
                    IdProduto = item.IdProduto,
                    Quantidade = item.Quantidade,
                    DataAtualizacao = DateTime.UtcNow,
                });
            }
        }

        await estoqueRepository.SalvarAsync();
        return Result<bool>.Ok(true);
    }

    public async Task<Result<bool>> AtualizarQuantidadeAsync(int idEstoque, AtualizarQuantidadeEstoqueDto dto)
    {
        if (dto.NovaQuantidade < 0)
            return Result<bool>.Falha("A quantidade não pode ser negativa.");

        var estoque = await estoqueRepository.BuscarPorIdAsync(idEstoque);
        if (estoque is null)
            return Result<bool>.Falha("Registro de estoque não encontrado.", TipoErro.NaoEncontrado);

        estoque.Quantidade = dto.NovaQuantidade;
        estoque.DataAtualizacao = DateTime.UtcNow;
        await estoqueRepository.SalvarAsync();
        return Result<bool>.Ok(true);
    }

    public async Task<Result<ListaPaginada<ProdutoResumidoDto>>> ListarProdutosAsync(ListarProdutosConsulta consulta)
    {
        var (items, total) = await estoqueRepository.ListarProdutosAsync(consulta);
        var dtos = items.Select(e => new ProdutoResumidoDto(e.IdProduto, e.Produto.Descricao, e.Quantidade)).ToList();
        return Result<ListaPaginada<ProdutoResumidoDto>>.Ok(
            new ListaPaginada<ProdutoResumidoDto>(dtos, total, consulta.Pagina, consulta.TamanhoPagina));
    }
}
