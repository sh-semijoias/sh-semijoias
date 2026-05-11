using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Estoque;
using ShSemijoias.Application.DTOs.Maletas;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Services;

public class MaletaService(
    IMaletaRepository maletaRepository,
    IEstoqueRepository estoqueRepository,
    IUsuarioRepository usuarioRepository) : IMaletaService
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
        var estoqueGeral = new Dictionary<int, int>();
        foreach (var idProduto in itensMaletaIds)
        {
            var eg = await estoqueRepository.BuscarPorProdutoAsync(idProduto);
            estoqueGeral[idProduto] = eg?.Quantidade ?? 0;
        }

        var itensDto = itensEstoque.Select(e => new ItemMaletaDetalheDto(
            e.Id,
            e.IdProduto,
            e.Produto.Descricao,
            e.Quantidade,
            (estoqueGeral.TryGetValue(e.IdProduto, out var qg) ? qg : 0) + e.Quantidade
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

        foreach (var item in dto.Itens!)
        {
            var estoqueGeral = await estoqueRepository.BuscarPorProdutoAsync(item.IdProduto);
            if (estoqueGeral is null || estoqueGeral.Quantidade < item.Quantidade)
                erros.Add($"Estoque insuficiente para o produto {item.IdProduto}. Disponível: {estoqueGeral?.Quantidade ?? 0}.");
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

        await maletaRepository.AdicionarAsync(maleta);
        await maletaRepository.SalvarAsync();

        foreach (var item in dto.Itens)
        {
            var estoqueGeral = await estoqueRepository.BuscarPorProdutoAsync(item.IdProduto);
            estoqueGeral!.Quantidade -= item.Quantidade;
            estoqueGeral.DataAtualizacao = DateTime.UtcNow;

            await estoqueRepository.AdicionarAsync(new Estoque
            {
                IdProduto = item.IdProduto,
                IdMaleta = maleta.Id,
                Quantidade = item.Quantidade,
                DataAtualizacao = DateTime.UtcNow,
            });
        }

        await maletaRepository.SalvarAsync();

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
            if (dto.Itens.Any(i => i.Quantidade <= 0))
                erros.Add("A quantidade de cada produto deve ser maior que zero.");

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

        foreach (var itemAtual in itensAtuais.Where(e => !novosIds.Contains(e.IdProduto)))
        {
            var estoqueGeral = await estoqueRepository.BuscarPorProdutoAsync(itemAtual.IdProduto);
            if (estoqueGeral is not null)
            {
                estoqueGeral.Quantidade += itemAtual.Quantidade;
                estoqueGeral.DataAtualizacao = DateTime.UtcNow;
            }
            await estoqueRepository.RemoverAsync(itemAtual);
        }

        foreach (var item in dto.Itens!)
        {
            if (mapaAtual.TryGetValue(item.IdProduto, out var itemAtual))
            {
                var delta = item.Quantidade - itemAtual.Quantidade;
                if (delta > 0)
                {
                    var estoqueGeral = await estoqueRepository.BuscarPorProdutoAsync(item.IdProduto);
                    if (estoqueGeral is null || estoqueGeral.Quantidade < delta)
                        erros.Add($"Estoque insuficiente para o produto {item.IdProduto}. Disponível: {estoqueGeral?.Quantidade ?? 0}.");
                    else
                    {
                        estoqueGeral.Quantidade -= delta;
                        estoqueGeral.DataAtualizacao = DateTime.UtcNow;
                        itemAtual.Quantidade = item.Quantidade;
                        itemAtual.DataAtualizacao = DateTime.UtcNow;
                    }
                }
                else if (delta < 0)
                {
                    var estoqueGeral = await estoqueRepository.BuscarPorProdutoAsync(item.IdProduto);
                    if (estoqueGeral is not null)
                    {
                        estoqueGeral.Quantidade += Math.Abs(delta);
                        estoqueGeral.DataAtualizacao = DateTime.UtcNow;
                    }
                    itemAtual.Quantidade = item.Quantidade;
                    itemAtual.DataAtualizacao = DateTime.UtcNow;
                }
            }
            else
            {
                var estoqueGeral = await estoqueRepository.BuscarPorProdutoAsync(item.IdProduto);
                if (estoqueGeral is null || estoqueGeral.Quantidade < item.Quantidade)
                    erros.Add($"Estoque insuficiente para o produto {item.IdProduto}. Disponível: {estoqueGeral?.Quantidade ?? 0}.");
                else
                {
                    estoqueGeral.Quantidade -= item.Quantidade;
                    estoqueGeral.DataAtualizacao = DateTime.UtcNow;

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

        if (erros.Count > 0)
            return Result<MaletaDto>.Falha(erros);

        maleta.IdUsuario = dto.IdUsuario;
        maleta.Descricao = descricao;
        maleta.DataAtualizacao = DateTime.UtcNow;

        await maletaRepository.SalvarAsync();

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

    public async Task<Result<ListaPaginada<ProdutoResumidoDto>>> ListarProdutosAsync(ListarProdutosMaletaConsulta consulta)
    {
        var (items, total) = await estoqueRepository.ListarProdutosComContextoMaletaAsync(consulta);
        var dtos = items.Select(e => new ProdutoResumidoDto(e.IdProduto, e.Produto.Descricao, e.Quantidade)).ToList();
        return Result<ListaPaginada<ProdutoResumidoDto>>.Ok(
            new ListaPaginada<ProdutoResumidoDto>(dtos, total, consulta.Pagina, consulta.TamanhoPagina));
    }

    public async Task<Result<IList<RevendedorDto>>> ListarRevendedoresAsync()
    {
        var usuarios = await usuarioRepository.ListarPorPerfilAsync("Revendedor");
        var dtos = usuarios.OrderBy(u => u.Nome).Select(u => new RevendedorDto(u.Id, u.Nome)).ToList();
        return Result<IList<RevendedorDto>>.Ok(dtos);
    }
}
