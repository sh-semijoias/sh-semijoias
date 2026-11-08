namespace ShSemijoias.Application.DTOs.Dashboard;

// Faixas de idade do estoque, sempre todas e na ordem, mesmo vazias. Sem giro: soma das faixas acima de 90 dias e nunca vendido
public record IdadeEstoqueDto(
    IList<FaixaIdadeEstoqueDto> Faixas,
    int QuantidadeSemGiro,
    decimal ValorSemGiro);

// Codigo: identificador estável da faixa ("0-30", "31-60", "61-90", "91-180", "mais-180", "nunca"); Valor a custo
public record FaixaIdadeEstoqueDto(
    string Codigo,
    string Descricao,
    int Quantidade,
    decimal Valor,
    bool SemGiro);
