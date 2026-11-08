namespace ShSemijoias.Application.DTOs.Dashboard;

// Percentual e composição (faturamento − repasse − CMV = lucro bruto) do período; a variação é em pontos percentuais
public record MargemBrutaDto(
    decimal Percentual,
    decimal? VariacaoPercentual,
    decimal Faturamento,
    decimal Repasse,
    decimal Cmv,
    decimal LucroBruto);
