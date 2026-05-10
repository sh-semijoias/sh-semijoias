using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Maletas;
using ShSemijoias.Application.Interfaces;

namespace ShSemijoias.Application.Services;

public class MaletaService(IMaletaRepository maletaRepository) : IMaletaService
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
}
