namespace ShSemijoias.Application.Common;

public static class FusoBrasilia
{
    public const string Id = "America/Sao_Paulo";

    public static readonly TimeZoneInfo Fuso = TimeZoneInfo.FindSystemTimeZoneById(Id);

    public static DateOnly Hoje() =>
        DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Fuso));
}
