namespace ShSemijoias.Application.Common;

public class Result<T>
{
    public bool Sucesso { get; private init; }
    public T? Valor { get; private init; }
    public IReadOnlyList<string> Erros { get; private init; } = [];
    public TipoErro TipoErro { get; private init; }

    public static Result<T> Ok(T valor) =>
        new() { Sucesso = true, Valor = valor };

    public static Result<T> Falha(string erro, TipoErro tipo = TipoErro.RegraDeNegocio) =>
        new() { Sucesso = false, Erros = [erro], TipoErro = tipo };

    public static Result<T> Falha(IReadOnlyList<string> erros, TipoErro tipo = TipoErro.RegraDeNegocio) =>
        new() { Sucesso = false, Erros = erros, TipoErro = tipo };
}
