using ShSemijoias.Application.Common;
using ShSemijoias.Application.DTOs.Vendas;
using ShSemijoias.Application.Interfaces;
using ShSemijoias.Domain.Entities;

namespace ShSemijoias.Application.Services;

public class VendaService(
    IVendaRepository vendaRepository,
    IEstoqueRepository estoqueRepository,
    IMaletaRepository maletaRepository,
    IClienteRepository clienteRepository) : IVendaService
{
    public async Task<Result<ListarVendasResultado>> ListarAsync(ListarVendasConsulta query)
    {
        var resultado = await vendaRepository.ListarAsync(query);

        var isAdmin = query.IdUsuario == null;
        if (!isAdmin)
            resultado = resultado with { TotalLucroPrevistoPeriodo = 0m, TotalLucroRealizadoPeriodo = 0m };

        return Result<ListarVendasResultado>.Ok(resultado);
    }

    public async Task<Result<IReadOnlyList<FormaPagamentoDto>>> ListarFormasPagamentoAsync()
    {
        var formas = await vendaRepository.ListarFormasPagamentoAtivasAsync();
        var dtos = formas
            .Select(f => new FormaPagamentoDto(f.Id, f.Descricao, f.PermiteParcelamento))
            .ToList();
        return Result<IReadOnlyList<FormaPagamentoDto>>.Ok(dtos);
    }

    public async Task<Result<VendaCriadaDto>> CriarAsync(CriarVendaDto dto, Guid idUsuario, bool isAdmin)
    {
        var erros = new List<string>();

        if (dto.Itens == null || dto.Itens.Count == 0)
            erros.Add("Informe ao menos um item.");

        if (dto.Itens != null)
        {
            if (dto.Itens.Any(i => i.Quantidade <= 0))
                erros.Add("A quantidade de cada item deve ser maior que zero.");

            if (dto.Itens.Any(i => i.PrecoVendaReal <= 0))
                erros.Add("O preço de venda de cada item deve ser maior que zero.");

            if (dto.Itens.GroupBy(i => i.IdEstoque).Any(g => g.Count() > 1))
                erros.Add("Não é permitido informar o mesmo produto mais de uma vez.");
        }

        if (dto.TotalParcelas < 1)
            erros.Add("O número de parcelas deve ser no mínimo 1.");
        else if (dto.TotalParcelas > 12)
            erros.Add("O número de parcelas deve ser no máximo 12.");

        if (await clienteRepository.ObterPorIdAsync(dto.IdCliente) is null)
            erros.Add("Cliente não encontrado.");

        var tipoPagamento = await vendaRepository.ObterTipoPagamentoAsync(dto.IdTipoPagamento);
        if (tipoPagamento is null || !tipoPagamento.Ativo)
            erros.Add("Forma de pagamento inválida.");
        else if (!tipoPagamento.PermiteParcelamento && dto.TotalParcelas > 1)
            erros.Add("A forma de pagamento selecionada não permite parcelamento.");

        if (erros.Count > 0)
            return Result<VendaCriadaDto>.Falha(erros);

Guid usuarioVenda = idUsuario;
int? idMaleta = null;

if (isAdmin)
{
    // Admin escolheu uma revendedora
    if (!string.IsNullOrWhiteSpace(dto.IdUsuario))
    {
        if (!Guid.TryParse(dto.IdUsuario, out usuarioVenda))
            return Result<VendaCriadaDto>.Falha("Revendedor inválido.");

        var maleta = await maletaRepository.ObterPorUsuarioAsync(usuarioVenda);

        if (maleta is null)
            return Result<VendaCriadaDto>.Falha("Revendedor não possui maleta ativa.");

        idMaleta = maleta.Id;
    }

    // se dto.IdUsuario for vazio:
    // usuarioVenda continua sendo o administrador
    // idMaleta continua null
}
else
{
    var maleta = await maletaRepository.ObterPorUsuarioAsync(usuarioVenda);

    if (maleta is null)
        return Result<VendaCriadaDto>.Falha("Revendedor não possui maleta ativa.");

    idMaleta = maleta.Id;
}

Console.WriteLine($"USUARIO VENDA: {usuarioVenda}");
Console.WriteLine($"MALETA ENCONTRADA: {idMaleta}");

var idsEstoque = dto.Itens.Select(i => i.IdEstoque).ToList();

Dictionary<int, Estoque> estoques;

if (idMaleta.HasValue)
{
    estoques = await estoqueRepository.BuscarPorIdsAsync(
        idsEstoque,
        idMaleta.Value
    );
}
else
{
    // venda do estoque geral
    estoques = await estoqueRepository.BuscarPorIdsAsync(
        idsEstoque
    );
}

        Console.WriteLine($"ESTOQUES ENCONTRADOS: {estoques.Count}");

        foreach (var item in dto.Itens!)
        {
            if (!estoques.TryGetValue(item.IdEstoque, out var estoque))
                erros.Add($"Produto não disponível para venda (estoque {item.IdEstoque}).");
            else if (estoque.Quantidade < item.Quantidade)
                erros.Add($"Estoque insuficiente para o produto {estoque.IdProduto}. Disponível: {estoque.Quantidade}.");
        }

        if (erros.Count > 0)
            return Result<VendaCriadaDto>.Falha(erros);

        var agora = DateTime.UtcNow;
        var valorTotal = dto.Itens!.Sum(i => i.PrecoVendaReal * i.Quantidade);

foreach (var item in dto.Itens)
{
    Console.WriteLine($"ID ESTOQUE RECEBIDO: {item.IdEstoque}");
}

        var venda = new Venda
        {
        IdCliente = dto.IdCliente,
     IdUsuario = usuarioVenda, // administrador ou revendedora
        IdTipoPagamento = dto.IdTipoPagamento,
            TotalParcelas = dto.TotalParcelas,
            Comentario = string.IsNullOrWhiteSpace(dto.Comentario) ? null : dto.Comentario.Trim(),
            DataVenda = agora,
            DataAtualizacao = agora,
            Itens = dto.Itens.Select(i =>
            {
                var estoque = estoques[i.IdEstoque];
                return new ItemVenda
                {
                    IdEstoque = i.IdEstoque,
                    Quantidade = i.Quantidade,
                    PrecoVendaReal = i.PrecoVendaReal,
                    PrecoCompra = estoque.Produto.PrecoCompra,
                    PrecoVendaSugerido = estoque.Produto.PrecoVendaSugerido,
                };
            }).ToList(),
            Parcelas = GerarParcelas(dto.TotalParcelas, valorTotal, agora),
        };

        await using var transacao = await vendaRepository.BeginTransacaoAsync();
        try
        {
            foreach (var item in dto.Itens)
            {
                var estoque = estoques[item.IdEstoque];
                estoque.Quantidade -= item.Quantidade;
                estoque.DataAtualizacao = agora;
            }

            await vendaRepository.CriarAsync(venda);
            await vendaRepository.SalvarAsync();
            await transacao.CommitAsync();
        }
        catch
        {
            await transacao.RollbackAsync();
            throw;
        }

        return Result<VendaCriadaDto>.Ok(
            new VendaCriadaDto(venda.Id, venda.DataVenda, valorTotal, venda.TotalParcelas));
    }

    public async Task<Result<bool>> CancelarAsync(int idVenda, CancelarVendaDto dto, Guid idUsuario, bool isAdmin)
    {
        var venda = await vendaRepository.ObterPorIdAsync(idVenda);
        if (venda is null)
            return Result<bool>.Falha("Venda não encontrada.", TipoErro.NaoEncontrado);

        if (venda.Cancelamento is not null)
            return Result<bool>.Falha("Venda já cancelada.");

        if (!isAdmin && venda.IdUsuario != idUsuario)
            return Result<bool>.Falha("Sem permissão para cancelar esta venda.", TipoErro.NaoAutorizado);

        var motivos = await vendaRepository.ListarMotivosCancelamentoAsync();
        if (motivos.All(m => m.Id != dto.IdMotivoCancelamentoVenda))
            return Result<bool>.Falha("Motivo de cancelamento inválido.");

        var agora = DateTime.UtcNow;

        await using var transacao = await vendaRepository.BeginTransacaoAsync();
        try
        {
            foreach (var item in venda.Itens)
            {
                item.Estoque.Quantidade += item.Quantidade;
                item.Estoque.DataAtualizacao = agora;
            }

            await vendaRepository.AdicionarCancelamentoAsync(new CancelamentoVenda
            {
                IdVenda = venda.Id,
                IdMotivoCancelamentoVenda = dto.IdMotivoCancelamentoVenda,
                DataCancelamento = agora,
            });

            venda.DataAtualizacao = agora;
            await vendaRepository.SalvarAsync();
            await transacao.CommitAsync();
        }
        catch
        {
            await transacao.RollbackAsync();
            throw;
        }

        return Result<bool>.Ok(true);
    }

    public async Task<Result<IReadOnlyList<MotivoCancelamentoDto>>> ListarMotivosCancelamentoAsync()
    {
        var motivos = await vendaRepository.ListarMotivosCancelamentoAsync();
        var dtos = motivos
            .Select(m => new MotivoCancelamentoDto(m.Id, m.Nome))
            .ToList();
        return Result<IReadOnlyList<MotivoCancelamentoDto>>.Ok(dtos);
    }

    public async Task<Result<IReadOnlyList<ParcelaVendaDto>>> ListarParcelasAsync(int idVenda, bool isAdmin)
    {
        if (!isAdmin)
            return Result<IReadOnlyList<ParcelaVendaDto>>.Falha(
                "Sem permissão para consultar as parcelas.", TipoErro.NaoAutorizado);

        var venda = await vendaRepository.ObterPorIdAsync(idVenda);
        if (venda is null)
            return Result<IReadOnlyList<ParcelaVendaDto>>.Falha("Venda não encontrada.", TipoErro.NaoEncontrado);

        var parcelas = await vendaRepository.ListarParcelasComRecebimentoAsync(idVenda);
        var dtos = parcelas
            .Select(p => new ParcelaVendaDto(
                p.Id,
                p.NumeroParcela,
                p.Valor,
                p.DataVencimento,
                p.Recebimento is not null,
                p.Recebimento?.DataRecebimento))
            .ToList();

        return Result<IReadOnlyList<ParcelaVendaDto>>.Ok(dtos);
    }

    public async Task<Result<bool>> RegistrarPagamentoAsync(int idVenda, RegistrarPagamentoDto dto, bool isAdmin)
    {
        if (!isAdmin)
            return Result<bool>.Falha("Sem permissão para registrar pagamento.", TipoErro.NaoAutorizado);

        var parcela = await vendaRepository.ObterParcelaParaPagamentoAsync(dto.IdParcela);
        if (parcela is null || parcela.IdVenda != idVenda)
            return Result<bool>.Falha("Parcela não encontrada.", TipoErro.NaoEncontrado);

        var erros = new List<string>();

        if (parcela.Venda.Cancelamento is not null)
            erros.Add("Não é possível registrar pagamento de uma venda cancelada.");

        if (parcela.Recebimento is not null)
            erros.Add("Parcela já recebida.");

        if (dto.DataPagamento > DateTime.UtcNow)
            erros.Add("A data de pagamento não pode ser futura.");

        if (erros.Count > 0)
            return Result<bool>.Falha(erros);

        await using var transacao = await vendaRepository.BeginTransacaoAsync();
        try
        {
            await vendaRepository.AdicionarRecebimentoAsync(new RecebimentoParcela
            {
                IdParcela = parcela.Id,
                ValorRecebido = parcela.Valor,
                DataRecebimento = dto.DataPagamento,
            });

            parcela.Venda.DataAtualizacao = DateTime.UtcNow;
            await vendaRepository.SalvarAsync();
            await transacao.CommitAsync();
        }
        catch
        {
            await transacao.RollbackAsync();
            throw;
        }

        return Result<bool>.Ok(true);
    }

    private static List<Parcela> GerarParcelas(int total, decimal valorTotal, DateTime dataVenda)
    {
        var valorParcela = Math.Round(valorTotal / total, 2, MidpointRounding.AwayFromZero);
        var parcelas = new List<Parcela>(total);
        for (var n = 1; n <= total; n++)
        {
            var valor = n == total
                ? valorTotal - valorParcela * (total - 1)
                : valorParcela;
            parcelas.Add(new Parcela
            {
                NumeroParcela = n,
                Valor = valor,
                DataVencimento = dataVenda.AddMonths(n),
            });
        }
        return parcelas;
    }

   public async Task<Result<VendaDetalheDto>> ObterPorIdAsync(
    int id,
    bool isAdmin)
{
    var venda = await vendaRepository.ObterPorIdAsync(id);

    if (venda is null)
        return Result<VendaDetalheDto>.Falha("Venda não encontrada.");

        Console.WriteLine($"Cliente null? {venda.Cliente == null}");
Console.WriteLine($"Usuario null? {venda.Usuario == null}");

foreach (var item in venda.Itens)
{
    Console.WriteLine($"Estoque null? {item.Estoque == null}");
    Console.WriteLine($"Produto null? {item.Estoque?.Produto == null}");
}

var dto = new VendaDetalheDto(
    venda.Id,
    venda.IdCliente,
    venda.Cliente?.Nome ?? "",
    venda.IdUsuario,
    venda.Usuario?.Nome ?? "",
    venda.IdTipoPagamento,
    venda.TotalParcelas,
    venda.Comentario,
    venda.Itens.Select(i =>
        new ItemVendaDetalheDto(
            i.IdEstoque,
            i.Estoque.IdProduto,
            i.Estoque.Produto?.Descricao ?? "",
            i.Quantidade,
            i.PrecoVendaReal
        )
    ).ToList()
);

    return Result<VendaDetalheDto>.Ok(dto);
}

}
