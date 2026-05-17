public interface IUserContext
{
    Guid UsuarioId { get; }

    bool IsAdmin { get; }
}