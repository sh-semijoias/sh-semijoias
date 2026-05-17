using ShSemijoias.Application.Common;
using ShSemijoias.Application.Common.Validators;
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
    public async Task<Result<ListaPaginada<UsuarioDto>>> ListarAsync(int pagina, int tamanhoPagina, string? perfil = null, string? busca = null)
    {
        var (usuarios, total) = await usuarioRepository.ListarAsync(pagina, tamanhoPagina, perfil, busca);

        var dtos = usuarios.Select(u => new UsuarioDto(
            u.Id, u.Nome, u.Email!,
            u.Perfis.FirstOrDefault()?.Name ?? string.Empty,
            u.PhoneNumber
        )).ToList();

        return Result<ListaPaginada<UsuarioDto>>.Ok(new ListaPaginada<UsuarioDto>(dtos, total, pagina, tamanhoPagina));
    }

    public async Task<UsuarioDto?> ObterPorIdAsync(Guid id)
    {
        var usuario = await usuarioRepository.ObterPorIdAsync(id);
        if (usuario is null) return null;

        var roles = await usuarioRepository.ObterPerfisAsync(usuario);
        return new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email ?? string.Empty, roles.FirstOrDefault() ?? string.Empty, usuario.PhoneNumber);
    }

    public async Task<Result<UsuarioDto>> CriarAsync(CriarUsuarioDto dto, string baseUrl)
    {
        var erros = new List<string>();

        if (string.IsNullOrWhiteSpace(dto.Nome)) erros.Add("Nome é obrigatório.");
        if (string.IsNullOrWhiteSpace(dto.Telefone)) erros.Add("Telefone é obrigatório.");

        if (erros.Count > 0) return Result<UsuarioDto>.Falha(erros);

        dto = dto with { Nome = dto.Nome.Trim(), Email = dto.Email.Trim(), Telefone = dto.Telefone.Trim() };

        var telefoneValido = TelefoneValidator.IsValid(dto.Telefone);
        if (!telefoneValido) erros.Add("Telefone inválido. Use o formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.");

        if (!await perfilRepository.ExisteAsync(dto.Perfil))
            erros.Add($"Perfil '{dto.Perfil}' não existe.");

        if (await usuarioRepository.ObterPorEmailAsync(dto.Email) is not null)
            erros.Add("Já existe um usuário cadastrado com este e-mail.");

        if (telefoneValido && await usuarioRepository.ObterPorTelefoneAsync(dto.Telefone) is not null)
            erros.Add("Já existe um usuário cadastrado com este telefone.");

        if (erros.Count > 0) return Result<UsuarioDto>.Falha(erros, TipoErro.Conflito);

        var usuario = new Usuario
        {
            UserName = dto.Email,
            Email = dto.Email,
            Nome = dto.Nome,
            PhoneNumber = dto.Telefone,
            DataCadastro = DateTime.UtcNow,
            DataAtualizacao = DateTime.UtcNow
        };

        await usuarioRepository.CriarAsync(usuario);
        await usuarioRepository.AdicionarPerfilAsync(usuario, dto.Perfil);

        var token = await usuarioRepository.GerarTokenResetSenhaAsync(usuario);
        var link = $"{baseUrl}/definir-senha?email={Uri.EscapeDataString(dto.Email)}&token={Uri.EscapeDataString(token)}";
        await emailService.EnviarConviteAsync(dto.Email, link);

        var roles = await usuarioRepository.ObterPerfisAsync(usuario);
        return Result<UsuarioDto>.Ok(new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email ?? string.Empty, roles.FirstOrDefault() ?? string.Empty, usuario.PhoneNumber));
    }

    public async Task<Result<UsuarioDto>> EditarAsync(Guid id, EditarUsuarioDto dto)
    {
        var erros = new List<string>();

        if (string.IsNullOrWhiteSpace(dto.Nome)) erros.Add("Nome é obrigatório.");
        if (string.IsNullOrWhiteSpace(dto.Telefone)) erros.Add("Telefone é obrigatório.");

        if (erros.Count > 0) return Result<UsuarioDto>.Falha(erros);

        dto = dto with { Nome = dto.Nome.Trim(), Telefone = dto.Telefone.Trim() };

        var telefoneValido = TelefoneValidator.IsValid(dto.Telefone);
        if (!telefoneValido) erros.Add("Telefone inválido. Use o formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.");

        if (!await perfilRepository.ExisteAsync(dto.Perfil))
            erros.Add($"Perfil '{dto.Perfil}' não existe.");

        var usuario = await usuarioRepository.ObterPorIdAsync(id);
        if (usuario is null)
            return Result<UsuarioDto>.Falha("Usuário não encontrado.", TipoErro.NaoEncontrado);

        if (telefoneValido && await usuarioRepository.ObterPorTelefoneAsync(dto.Telefone) is { } existente && existente.Id != id)
            erros.Add("Já existe um usuário cadastrado com este telefone.");

        if (erros.Count > 0) return Result<UsuarioDto>.Falha(erros, TipoErro.Conflito);

        usuario.Nome = dto.Nome;
        usuario.PhoneNumber = dto.Telefone;
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
        return Result<UsuarioDto>.Ok(new UsuarioDto(usuario.Id, usuario.Nome, usuario.Email ?? string.Empty, roles.FirstOrDefault() ?? string.Empty, usuario.PhoneNumber));
    }
}
