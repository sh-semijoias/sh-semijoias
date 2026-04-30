using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Usuarios;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Services;

public class UsuarioService(
    IUsuarioRepository usuarioRepository,
    IPerfilRepository perfilRepository,
    IEmailService emailService) : IUsuarioService
{
    public async Task<Result<ListaPaginada<UsuarioDto>>> ListarAsync(int pagina, int tamanhoPagina)
    {
        var (usuarios, total) = await usuarioRepository.ListarAsync(pagina, tamanhoPagina);
        var dtos = new List<UsuarioDto>();

        foreach (var u in usuarios)
        {
            var roles = await usuarioRepository.ObterPerfisAsync(u);
            dtos.Add(new UsuarioDto(u.Id, u.Nome, u.Email!, roles.FirstOrDefault() ?? string.Empty));
        }

        return Result<ListaPaginada<UsuarioDto>>.Ok(new ListaPaginada<UsuarioDto>(dtos, total, pagina, tamanhoPagina));
    }

    public async Task<UsuarioDto?> ObterPorIdAsync(Guid id)
    {
        var usuario = await usuarioRepository.ObterPorIdAsync(id);
        if (usuario is null) return null;

        var roles = await usuarioRepository.ObterPerfisAsync(usuario);
        return new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email ?? string.Empty, roles.FirstOrDefault() ?? string.Empty);
    }

    public async Task<Result<UsuarioDto>> CriarAsync(CriarUsuarioDto dto, string baseUrl)
    {
        if (!await perfilRepository.ExisteAsync(dto.Perfil))
            return Result<UsuarioDto>.Falha($"Perfil '{dto.Perfil}' não existe.");

        if (await usuarioRepository.ObterPorEmailAsync(dto.Email) is not null)
            return Result<UsuarioDto>.Falha("Já existe um usuário cadastrado com este e-mail.", TipoErro.Conflito);

        var usuario = new Usuario
        {
            UserName = dto.Email,
            Email = dto.Email,
            Nome = dto.Nome,
            DataCadastro = DateTime.UtcNow,
            DataAtualizacao = DateTime.UtcNow
        };

        await usuarioRepository.CriarAsync(usuario);
        await usuarioRepository.AdicionarPerfilAsync(usuario, dto.Perfil);

        var token = await usuarioRepository.GerarTokenResetSenhaAsync(usuario);
        var link = $"{baseUrl}/definir-senha?email={Uri.EscapeDataString(dto.Email)}&token={Uri.EscapeDataString(token)}";
        await emailService.EnviarConviteAsync(dto.Email, link);

        var roles = await usuarioRepository.ObterPerfisAsync(usuario);
        return Result<UsuarioDto>.Ok(new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email ?? string.Empty, roles.FirstOrDefault() ?? string.Empty));
    }

    public async Task<Result<UsuarioDto>> EditarAsync(Guid id, EditarUsuarioDto dto)
    {
        if (!await perfilRepository.ExisteAsync(dto.Perfil))
            return Result<UsuarioDto>.Falha($"Perfil '{dto.Perfil}' não existe.");

        var usuario = await usuarioRepository.ObterPorIdAsync(id);
        if (usuario is null)
            return Result<UsuarioDto>.Falha("Usuário não encontrado.", TipoErro.NaoEncontrado);

        usuario.Nome = dto.Nome;
        usuario.DataAtualizacao = DateTime.UtcNow;

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
        return Result<UsuarioDto>.Ok(new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email ?? string.Empty, roles.FirstOrDefault() ?? string.Empty));
    }
}
