using System.Text.RegularExpressions;

namespace ShSemijoias.Application.Common.Validators;

public static class TelefoneValidator
{
    private static readonly Regex Pattern =
        new(@"^\(\d{2}\) \d{4,5}-\d{4}$", RegexOptions.Compiled);

    public static bool IsValid(string? telefone) =>
        telefone is null || Pattern.IsMatch(telefone);
}
