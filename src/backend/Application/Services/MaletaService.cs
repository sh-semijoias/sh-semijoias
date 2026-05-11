using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Maletas;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Services;

public class MaletaService(
    IMaletaRepository maletaRepository,
    IEstoqueRepository estoqueRepository) : IMaletaService
{
    public async Task<Result<ListaPaginada<MaletaDto>>> ListarAsync(ListarMaletasConsulta query)
    {
        var (items, total) = await maletaRepository.ListarAsync(query);
        var dtos = items.Select(v => new MaletaDto(
            v.Maleta.Id,
            v.Maleta.Descricao,
            v.Maleta.Usuario.Nome,
            v.TotalProdutos,
            v.TotalItens,
            v.Maleta.DataCadastro,
            v.Maleta.DataAtualizacao
        )).ToList();
        return Result<ListaPaginada<MaletaDto>>.Ok(
            new ListaPaginada<MaletaDto>(dtos, total, query.Pagina, query.TamanhoPagina));
    }

    public async Task<Result<MaletaDetalheDto>> ObterPorIdAsync(int id, Guid? idUsuario)
    {
        var maleta = await maletaRepository.ObterPorIdAsync(id);
        if (maleta is null)
            return Result<MaletaDetalheDto>.Falha("Maleta não encontrada.", TipoErro.NaoEncontrado);

        if (idUsuario.HasValue && maleta.IdUsuario != idUsuario.Value)
            return Result<MaletaDetalheDto>.Falha("Acesso negado.", TipoErro.NaoAutorizado);

        var itensEstoque = await maletaRepository.ListarItensMaletaAsync(id);

        var itensMaletaIds = itensEstoque.Select(e => e.IdProduto).ToList();
        var estoqueGeralDict = await estoqueRepository.BuscarPorProdutosAsync(itensMaletaIds);

        var itensDto = itensEstoque.Select(e => new ItemMaletaDetalheDto(
            e.Id,
            e.IdProduto,
            e.Produto.Descricao,
            e.Quantidade,
            estoqueGeralDict.TryGetValue(e.IdProduto, out var qg) ? qg.Quantidade : 0
        )).ToList();

        return Result<MaletaDetalheDto>.Ok(new MaletaDetalheDto(
            maleta.Id,
            maleta.Descricao,
            maleta.IdUsuario,
            maleta.Usuario.Nome,
            itensDto));
    }

    public async Task<Result<MaletaDto>> CriarAsync(CriarEditarMaletaDto dto)
    {
        var erros = new List<string>();

        if (string.IsNullOrWhiteSpace(dto.Descricao))
            erros.Add("Descrição é obrigatória.");
        else if (dto.Descricao.Trim().Length > 200)
            erros.Add("Descrição deve ter no máximo 200 caracteres.");

        if (dto.Itens == null || dto.Itens.Count == 0)
            erros.Add("Informe ao menos um produto.");

        if (dto.Itens != null)
        {
            if (dto.Itens.Any(i => i.Quantidade <= 0))
                erros.Add("A quantidade de cada produto deve ser maior que zero.");

            if (dto.Itens.GroupBy(i => i.IdProduto).Any(g => g.Count() > 1))
                erros.Add("Não é permitido informar o mesmo produto mais de uma vez.");
        }

        if (erros.Count > 0)
            return Result<MaletaDto>.Falha(erros);

        var descricao = dto.Descricao.Trim();
        var idsParaValidar = dto.Itens!.Select(i => i.IdProduto).ToList();
        var estoqueGeralDict = await estoqueRepository.BuscarPorProdutosAsync(idsParaValidar);

        foreach (var item in dto.Itens!)
        {
            estoqueGeralDict.TryGetValue(item.IdProduto, out var eg);
            if (eg is null || eg.Quantidade < item.Quantidade)
                erros.Add($"Estoque insuficiente para o produto {item.IdProduto}. Disponível: {eg?.Quantidade ?? 0}.");
        }

        if (erros.Count > 0)
            return Result<MaletaDto>.Falha(erros);

        var maleta = new Maleta
        {
            IdUsuario = dto.IdUsuario,
            Descricao = descricao,
            DataCadastro = DateTime.UtcNow,
            DataAtualizacao = DateTime.UtcNow,
        };

        await using var transacao = await maletaRepository.BeginTransacaoAsync();
        try
        {
            await maletaRepository.AdicionarAsync(maleta);
            await maletaRepository.SalvarAsync();

            foreach (var item in dto.Itens)
            {
                var eg = estoqueGeralDict[item.IdProduto];
                eg.Quantidade -= item.Quantidade;
                eg.DataAtualizacao = DateTime.UtcNow;

                await estoqueRepository.AdicionarAsync(new Estoque
                {
                    IdProduto = item.IdProduto,
                    IdMaleta = maleta.Id,
                    Quantidade = item.Quantidade,
                    DataAtualizacao = DateTime.UtcNow,
                });
            }

            await maletaRepository.SalvarAsync();
            await transacao.CommitAsync();
        }
        catch
        {
            await transacao.RollbackAsync();
            throw;
        }

        var recarregada = await maletaRepository.ObterPorIdAsync(maleta.Id);
        return Result<MaletaDto>.Ok(new MaletaDto(
            maleta.Id,
            maleta.Descricao,
            recarregada!.Usuario.Nome,
            dto.Itens.Count,
            dto.Itens.Sum(i => i.Quantidade),
            maleta.DataCadastro,
            maleta.DataAtualizacao));
    }

    public async Task<Result<MaletaDto>> EditarAsync(int id, CriarEditarMaletaDto dto)
    {
        var erros = new List<string>();

        if (string.IsNullOrWhiteSpace(dto.Descricao))
            erros.Add("Descrição é obrigatória.");
        else if (dto.Descricao.Trim().Length > 200)
            erros.Add("Descrição deve ter no máximo 200 caracteres.");

        if (dto.Itens == null || dto.Itens.Count == 0)
            erros.Add("Informe ao menos um produto.");

        if (dto.Itens != null)
        {
            if (dto.Itens.Any(i => i.Quantidade < 0))
                erros.Add("A quantidade de cada produto não pode ser negativa.");

            if (dto.Itens.GroupBy(i => i.IdProduto).Any(g => g.Count() > 1))
                erros.Add("Não é permitido informar o mesmo produto mais de uma vez.");
        }

        if (erros.Count > 0)
            return Result<MaletaDto>.Falha(erros);

        var maleta = await maletaRepository.ObterPorIdAsync(id);
        if (maleta is null)
            return Result<MaletaDto>.Falha("Maleta não encontrada.", TipoErro.NaoEncontrado);

        var descricao = dto.Descricao.Trim();
        var itensAtuais = await maletaRepository.ListarItensMaletaAsync(id);
        var mapaAtual = itensAtuais.ToDictionary(e => e.IdProduto);
        var novosIds = dto.Itens!.Select(i => i.IdProduto).ToHashSet();

        var idsExistentesAusentes = mapaAtual.Keys.Where(idP => !novosIds.Contains(idP)).ToList();
        if (idsExistentesAusentes.Count > 0)
            return Result<MaletaDto>.Falha("Não é permitido remover produtos que já existiam na maleta.");

        var todosIdsRelevantes = novosIds.ToList();
        var estoqueGeralDict = await estoqueRepository.BuscarPorProdutosAsync(todosIdsRelevantes);

        foreach (var item in dto.Itens!)
        {
            if (mapaAtual.TryGetValue(item.IdProduto, out var itemAtual))
            {
                var delta = item.Quantidade - itemAtual.Quantidade;
                if (delta > 0)
                {
                    estoqueGeralDict.TryGetValue(item.IdProduto, out var eg);
                    if (eg is null || eg.Quantidade < delta)
                        erros.Add($"Estoque insuficiente para o produto {item.IdProduto}. Disponível: {eg?.Quantidade ?? 0}.");
                    else
                    {
                        eg.Quantidade -= delta;
                        eg.DataAtualizacao = DateTime.UtcNow;
                        itemAtual.Quantidade = item.Quantidade;
                        itemAtual.DataAtualizacao = DateTime.UtcNow;
                    }
                }
                else if (delta < 0)
                {
                    if (estoqueGeralDict.TryGetValue(item.IdProduto, out var eg))
                    {
                        eg.Quantidade += Math.Abs(delta);
                        eg.DataAtualizacao = DateTime.UtcNow;
                    }
                    itemAtual.Quantidade = item.Quantidade;
                    itemAtual.DataAtualizacao = DateTime.UtcNow;
                }
            }
            else
            {
                if (item.Quantidade <= 0)
                    erros.Add($"A quantidade do produto {item.IdProduto} deve ser maior que zero.");
                else
                {
                    estoqueGeralDict.TryGetValue(item.IdProduto, out var eg);
                    if (eg is null || eg.Quantidade < item.Quantidade)
                        erros.Add($"Estoque insuficiente para o produto {item.IdProduto}. Disponível: {eg?.Quantidade ?? 0}.");
                    else
                    {
                        eg.Quantidade -= item.Quantidade;
                        eg.DataAtualizacao = DateTime.UtcNow;

                        await estoqueRepository.AdicionarAsync(new Estoque
                        {
                            IdProduto = item.IdProduto,
                            IdMaleta = id,
                            Quantidade = item.Quantidade,
                            DataAtualizacao = DateTime.UtcNow,
                        });
                    }
                }
            }
        }

        if (erros.Count > 0)
            return Result<MaletaDto>.Falha(erros);

        maleta.IdUsuario = dto.IdUsuario;
        maleta.Descricao = descricao;
        maleta.DataAtualizacao = DateTime.UtcNow;

        await using var transacao = await maletaRepository.BeginTransacaoAsync();
        try
        {
            await maletaRepository.SalvarAsync();
            await transacao.CommitAsync();
        }
        catch
        {
            await transacao.RollbackAsync();
            throw;
        }

        var recarregada = await maletaRepository.ObterPorIdAsync(id);
        return Result<MaletaDto>.Ok(new MaletaDto(
            maleta.Id,
            maleta.Descricao,
            recarregada!.Usuario.Nome,
            dto.Itens.Count,
            dto.Itens.Sum(i => i.Quantidade),
            maleta.DataCadastro,
            maleta.DataAtualizacao));
    }
}
