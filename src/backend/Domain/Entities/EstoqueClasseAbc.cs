namespace ShSemijoias.Domain.Entities;

// Estoque disponível a custo e CMV do período dos produtos de uma classe da curva ABC (sem arredondar)
public record EstoqueClasseAbc(string Classe, decimal ValorEstoque, decimal Cmv);
