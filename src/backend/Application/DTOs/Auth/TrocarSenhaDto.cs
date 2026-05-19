namespace ShSemijoias.Application.DTOs.Auth;

public record TrocarSenhaDto(string? SenhaAtual, string NovaSenha, string ConfirmacaoNovaSenha);
