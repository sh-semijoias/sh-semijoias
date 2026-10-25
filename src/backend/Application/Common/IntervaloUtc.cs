namespace ShSemijoias.Application.Common;

public readonly record struct IntervaloUtc(DateTime Inicio, DateTime FimExclusivo)
{
    // Datas inclusivas no horário de Brasília → intervalo UTC [início, fim + 1 dia)
    public static IntervaloUtc De(DateOnly dataInicio, DateOnly dataFim) =>
        new(ParaUtc(dataInicio), ParaUtc(dataFim.AddDays(1)));

    private static DateTime ParaUtc(DateOnly data) =>
        TimeZoneInfo.ConvertTimeToUtc(data.ToDateTime(TimeOnly.MinValue), FusoBrasilia.Fuso);
}
