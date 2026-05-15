using ShSemijoias.Application.Common;
using ShSemijoias.Application.Common.Validators;
using ShSemijoias.Application.DTOs;
using ShSemijoias.Application.DTOs.Clientes;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Services;

public class ClientesService(
    IClienteRepository clienteRepository
   // IPerfilRepository perfilRepository,
    //IEmailService emailService
    ) : IClienteService
{
public async Task<Result<ListaPaginada<ClientesDto>>> ListarAsync(int pagina, int tamanhoPagina, string? busca = null)
{
    var (clientes, total) = await clienteRepository.ListarAsync(pagina, tamanhoPagina, busca);

    var dtos = clientes.Select(u =>
        new ClientesDto(
            u.Id,
            u.Nome,
            u.Email ?? string.Empty,
            u.CPF ?? string.Empty,
            u.Telefone ?? string.Empty
        )
    ).ToList();

    return Result<ListaPaginada<ClientesDto>>.Ok(
        new ListaPaginada<ClientesDto>(dtos, total, pagina, tamanhoPagina)
    );
}

public async Task<ClientesDto?> ObterPorIdAsync(int id)
{
    var cliente = await clienteRepository.ObterPorIdAsync(id);
    if (cliente is null) return null;

    return new ClientesDto(
        cliente.Id,
        cliente.Nome,
        cliente.Email ?? string.Empty,
        cliente.CPF ?? string.Empty,
        cliente.Telefone ?? string.Empty
    );
}

  public async Task<Result<ClientesDto>> CriarAsync(CriarClientesDto dto, string baseUrl)
{
    var erros = new List<string>();

    if (string.IsNullOrWhiteSpace(dto.Nome)) erros.Add("Nome é obrigatório.");
    if (string.IsNullOrWhiteSpace(dto.Telefone)) erros.Add("Telefone é obrigatório.");

    if (erros.Count > 0) return Result<ClientesDto>.Falha(erros);

    dto = dto with
    {
        Nome = dto.Nome.Trim(),
        Email = dto.Email.Trim(),
        Telefone = dto.Telefone.Trim()
    };

    var telefoneValido = TelefoneValidator.IsValid(dto.Telefone);
    if (!telefoneValido)
        erros.Add("Telefone inválido.");

    if (await clienteRepository.ObterPorEmailAsync(dto.Email) is not null)
        erros.Add("E-mail já existe.");

    if (await clienteRepository.ObterPorTelefoneAsync(dto.Telefone) is not null)
        erros.Add("Telefone já existe.");

    if (erros.Count > 0)
        return Result<ClientesDto>.Falha(erros, TipoErro.Conflito);

    var cliente = new Cliente
    {
        Nome = dto.Nome,
        Email = dto.Email,
        CPF = dto.CPF,
        Telefone = dto.Telefone,
        DataCadastro = DateTime.UtcNow,
        DataAtualizacao = DateTime.UtcNow
    };

    await clienteRepository.CriarAsync(cliente);

    return Result<ClientesDto>.Ok(new ClientesDto(
        cliente.Id,
        cliente.Nome,
        cliente.Email ?? string.Empty,
        string.Empty,
        cliente.Telefone ?? string.Empty
    ));
}

   public async Task<Result<ClientesDto>> EditarAsync(int id, EditarClientesDto dto)
{
    var erros = new List<string>();

    if (string.IsNullOrWhiteSpace(dto.Nome))
        erros.Add("Nome é obrigatório.");

    if (string.IsNullOrWhiteSpace(dto.Telefone))
        erros.Add("Telefone é obrigatório.");

    dto = dto with
    {
        Nome = dto.Nome.Trim(),
        Telefone = dto.Telefone.Trim()
    };

    var telefoneValido = TelefoneValidator.IsValid(dto.Telefone);
    if (!telefoneValido)
        erros.Add("Telefone inválido. Use (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.");

    var cliente = await clienteRepository.ObterPorIdAsync(id);
    if (cliente is null)
        return Result<ClientesDto>.Falha("Cliente não encontrado.", TipoErro.NaoEncontrado);

    if (await clienteRepository.ObterPorTelefoneAsync(dto.Telefone) is { } existente
        && existente.Id != id)
    {
        erros.Add("Já existe um cliente cadastrado com este telefone.");
    }

    if (erros.Count > 0)
        return Result<ClientesDto>.Falha(erros, TipoErro.Conflito);

    cliente.Nome = dto.Nome;
    cliente.Telefone = dto.Telefone;
    cliente.Email = dto.Email;
    cliente.CPF = dto.CPF;
    cliente.DataAtualizacao = DateTime.UtcNow;

    await clienteRepository.AtualizarAsync(cliente);

    return Result<ClientesDto>.Ok(new ClientesDto(
        cliente.Id,
        cliente.Nome,
    
        cliente.Email ?? string.Empty,
        string.Empty,
        cliente.Telefone ?? string.Empty
    ));
}
}