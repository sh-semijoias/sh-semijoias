using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Usuarios;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;
using ShSemijoias.Domain.Enums;

namespace ShSemijoias.Application.Services;

public class UsuarioService(
    IUsuarioRepository usuarioRepository,
    IPerfilRepository perfilRepository,
    IEmailService emailService) : IUsuarioService
{
    public async Task<IList<UsuarioDto>> ListarAsync()
    {
        var usuarios = await usuarioRepository.ListarAsync();
        var dtos = new List<UsuarioDto>();

        foreach (var u in usuarios)
        {
            var roles = await usuarioRepository.ObterPerfisAsync(u);
            dtos.Add(new UsuarioDto(u.Id, u.Nome, u.Email!, roles.FirstOrDefault() ?? string.Empty, u.PercentualComissao));
        }

        return dtos;
    }

    public async Task<UsuarioDto?> ObterPorIdAsync(Guid id)
    {
        var usuario = await usuarioRepository.ObterPorIdAsync(id);
        if (usuario is null) return null;

        var roles = await usuarioRepository.ObterPerfisAsync(usuario);
        return new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email!, roles.FirstOrDefault() ?? string.Empty, usuario.PercentualComissao);
    }

    public async Task<Result<UsuarioDto>> CriarAsync(CriarUsuarioDto dto, string baseUrl)
    {
        var erros = new List<string>();

        if (!await perfilRepository.ExisteAsync(dto.Perfil))
            erros.Add($"Perfil '{dto.Perfil}' não existe.");

        if (dto.Perfil == Perfis.Revendedor && dto.PercentualComissao is null)
            erros.Add("O percentual de comissão é obrigatório para o perfil Revendedor.");

        if (erros.Count > 0)
            return Result<UsuarioDto>.Falha(erros);

        if (await usuarioRepository.ObterPorEmailAsync(dto.Email) is not null)
            return Result<UsuarioDto>.Falha("Já existe um usuário cadastrado com este e-mail.", TipoErro.Conflito);

        var usuario = new Usuario
        {
            UserName = dto.Email,
            Email = dto.Email,
            Nome = dto.Nome,
            PercentualComissao = dto.Perfil == Perfis.Revendedor ? dto.PercentualComissao : null
        };

        await usuarioRepository.CriarAsync(usuario);
        await usuarioRepository.AdicionarPerfilAsync(usuario, dto.Perfil);

        var token = await usuarioRepository.GerarTokenResetSenhaAsync(usuario);
        var link = $"{baseUrl}/definir-senha?email={Uri.EscapeDataString(dto.Email)}&token={Uri.EscapeDataString(token)}";
        await emailService.EnviarConviteAsync(dto.Email, link);

        var roles = await usuarioRepository.ObterPerfisAsync(usuario);
        return Result<UsuarioDto>.Ok(new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email!, roles.FirstOrDefault() ?? string.Empty, usuario.PercentualComissao));
    }

    public async Task<Result<UsuarioDto>> EditarAsync(Guid id, EditarUsuarioDto dto)
    {
        var erros = new List<string>();

        if (!await perfilRepository.ExisteAsync(dto.Perfil))
            erros.Add($"Perfil '{dto.Perfil}' não existe.");

        if (dto.Perfil == Perfis.Revendedor && dto.PercentualComissao is null)
            erros.Add("O percentual de comissão é obrigatório para o perfil Revendedor.");

        if (erros.Count > 0)
            return Result<UsuarioDto>.Falha(erros);

        var usuario = await usuarioRepository.ObterPorIdAsync(id);
        if (usuario is null)
            return Result<UsuarioDto>.Falha("Usuário não encontrado.", TipoErro.NaoEncontrado);

        usuario.Nome = dto.Nome;
        usuario.PercentualComissao = dto.Perfil == Perfis.Revendedor ? dto.PercentualComissao : null;

        var rolesAtuais = await usuarioRepository.ObterPerfisAsync(usuario);
        var perfilAtual = rolesAtuais.FirstOrDefault();

        if (perfilAtual != dto.Perfil)
        {
            if (perfilAtual is not null)
                await usuarioRepository.RemoverPerfilAsync(usuario, perfilAtual);
            await usuarioRepository.AdicionarPerfilAsync(usuario, dto.Perfil);
        }

        await usuarioRepository.AtualizarAsync(usuario);

        var roles = await usuarioRepository.ObterPerfisAsync(usuario);
        return Result<UsuarioDto>.Ok(new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email!, roles.FirstOrDefault() ?? string.Empty, usuario.PercentualComissao));
    }
}
