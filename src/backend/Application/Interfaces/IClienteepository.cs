using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Interfaces;

/*
public interface IClienteRepository
{
    Task<(IList<Cliente> Items, int Total)> ListarAsync(int pagina, int tamanhoPagina);
    Task<Cliente?> ObterPorIdAsync(int id);
    Task<Cliente?> ObterPorEmailAsync(string email);
    Task<Cliente?> ObterPorTelefoneAsync(string telefone);
    Task<IList<string>> ObterPerfisAsync(Cliente cliente);
    Task CriarAsync(Cliente cliente);
    Task AdicionarPerfilAsync(Cliente cliente, string perfil);
    Task RemoverPerfilAsync(Cliente cliente, string perfil);
    Task AtualizarAsync(Cliente cliente);
    Task<string> GerarTokenResetSenhaAsync(Cliente cliente);
}

*/
public interface IClienteRepository
{
    Task<(IList<Cliente> Items, int Total)> ListarAsync(int pagina, int tamanhoPagina, string? busca = null);
    Task<Cliente?> ObterPorIdAsync(int id);
    Task<Cliente?> ObterPorEmailAsync(string email);
    Task<Cliente?> ObterPorTelefoneAsync(string telefone);
    Task CriarAsync(Cliente cliente);
    Task AtualizarAsync(Cliente cliente);
}