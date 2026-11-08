namespace ShSemijoias.Domain.Entities;

// Peças em estoque e valor a custo de uma faixa de idade (dias desde a última venda do produto).
// Faixa: índice na ordem das faixas, de 0 (0–30 dias) a 5 (nunca vendido); faixas sem peças não vêm do banco
public record PecasFaixaIdade(int Faixa, int Quantidade, decimal Valor);
