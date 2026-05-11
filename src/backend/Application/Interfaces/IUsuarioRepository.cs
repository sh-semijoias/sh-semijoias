using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Interfaces;

public interface IUsuarioRepository
{
    Task<(IList<Usuario> Items, int Total)> ListarAsync(int pagina, int tamanhoPagina);
    Task<Usuario?> ObterPorIdAsync(Guid id);
    Task<Usuario?> ObterPorEmailAsync(string email);
    Task<Usuario?> ObterPorTelefoneAsync(string telefone);
    Task<IList<string>> ObterPerfisAsync(Usuario usuario);
    Task CriarAsync(Usuario usuario);
    Task AdicionarPerfilAsync(Usuario usuario, string perfil);
    Task RemoverPerfilAsync(Usuario usuario, string perfil);
    Task AtualizarAsync(Usuario usuario);
    Task<string> GerarTokenResetSenhaAsync(Usuario usuario);
    Task<IList<Usuario>> ListarPorPerfilAsync(string perfil);
}
