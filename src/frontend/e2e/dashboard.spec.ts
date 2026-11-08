import { expect, Page, test } from '@playwright/test';

// Os dados do seed (scripts/seed-dados-teste.sql) terminam em 12/10/2026: com o relógio nessa data,
// o período padrão do dashboard (últimos 90 dias) é 15/07/2026 – 12/10/2026
const DATA_BASE_SEED = new Date('2026-10-12T12:00:00-03:00');

async function entrar(page: Page, usuario: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(`${usuario}@shsemijoias.com.br`);
  await page.getByLabel('Senha', { exact: true }).fill('Admin@12345');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/vendas$/);
}

// Soma das faixas da idade do estoque, lida do card: peças, valor (soma das faixas em reais inteiros, como exibidas) e peças sem giro
async function totaisIdadeEstoque(page: Page): Promise<{ pecas: number; valor: number; pecasSemGiro: number }> {
  const textos = await page.locator('app-card-idade-estoque').getByRole('listitem').allInnerTexts();
  const numero = (texto: string) => Number(texto.replace(/\./g, ''));
  const faixas = textos.map(texto => {
    const [, pecas, valor] = texto.match(/([\d.]+) peças? · R\$\s([\d.]+)/) ?? [];
    return { semGiro: /91–180|Mais de 180|Nunca/.test(texto), pecas: numero(pecas), valor: numero(valor) };
  });
  return {
    pecas: faixas.reduce((total, f) => total + f.pecas, 0),
    valor: faixas.reduce((total, f) => total + f.valor, 0),
    pecasSemGiro: faixas.filter(f => f.semGiro).reduce((total, f) => total + f.pecas, 0),
  };
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(DATA_BASE_SEED);
  // Sem animação nos gráficos: ela usa a data, que o relógio fixo congela, e os prints sairiam sem as linhas.
  // Pelo emulateMedia porque a opção reducedMotion do config não chegou ao navegador
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test.describe('administrador', () => {
  test.beforeEach(async ({ page }) => {
    await entrar(page, 'maria.silva');
  });

  test('exibe os indicadores do período', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('15/07/2026 – 12/10/2026')).toBeVisible();

    await expect(page.locator('app-card-ticket-medio')).toContainText(/R\$\s99,38/);
    await expect(page.locator('app-card-ticket-medio')).toContainText('506 vendas');
    await expect(page.locator('app-card-margem-bruta')).toContainText('50,76%');
    await expect(page.locator('app-card-dias-estoque')).toContainText('79 dias');
    await expect(page.locator('app-card-dias-estoque')).toContainText('base 90 dias');
    await expect(page.locator('app-card-pecas-sem-giro')).toContainText('peças');

    await expect(page.locator('app-card-curva-abc [echarts] svg')).toBeVisible();

    const produtosPorClasse = page.locator('app-card-produtos-por-classe');
    await expect(produtosPorClasse.getByRole('tab', { name: /Classe A/ })).toBeVisible();
    await expect(produtosPorClasse.getByRole('listitem').first()).toContainText('Anel Pedra Verde');

    await expect(page.locator('app-card-faturamento-clientes').getByRole('row').nth(1)).toContainText('Isabela Lopes');

    await expect(page.getByText('Não foi possível carregar.')).toHaveCount(0);
  });

  test('filtra os indicadores por categoria', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('app-card-ticket-medio')).toContainText('506 vendas');

    await page.getByRole('combobox', { name: 'Categoria' }).click();
    await page.getByRole('option', { name: 'Brinco' }).click();

    await expect(page.locator('app-card-ticket-medio')).toContainText(/R\$\s50,41/);
    await expect(page.locator('app-card-ticket-medio')).toContainText('67 vendas');
    await expect(page.locator('app-card-curva-abc')).toContainText('Produtos da categoria');
  });

  test('filtra os indicadores por período', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('app-card-ticket-medio')).toContainText('506 vendas');

    await page.getByRole('button', { name: 'Escolher período' }).click();
    await page.getByRole('button', { name: 'Últimos 30 dias' }).click();

    await expect(page.getByText('13/09/2026 – 12/10/2026')).toBeVisible();
    await expect(page.locator('app-card-ticket-medio')).toContainText(/R\$\s102,18/);
    await expect(page.locator('app-card-ticket-medio')).toContainText('185 vendas');
  });

  test('filtra os indicadores por revendedor', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('app-card-ticket-medio')).toContainText('506 vendas');

    await page.getByLabel('Revendedor').fill('Ana');
    await page.getByRole('option', { name: 'Ana Costa' }).click();

    await expect(page.locator('app-card-ticket-medio')).toContainText(/R\$\s103,95/);
    await expect(page.locator('app-card-ticket-medio')).toContainText('121 vendas');
  });

  test('navega pelas páginas e classes dos produtos', async ({ page }) => {
    await page.goto('/dashboard');
    const card = page.locator('app-card-produtos-por-classe');
    await expect(card.getByRole('listitem').first()).toContainText('Anel Pedra Verde');

    await card.getByRole('button', { name: 'Próxima página' }).click();
    await expect(card.getByRole('listitem').first()).toContainText('#6');
    await expect(card.getByRole('listitem').first()).toContainText('Gargantilha Riviera Dourada');

    await card.getByRole('tab', { name: /Classe C/ }).click();
    await expect(card).toContainText('44 produtos');
    await expect(card).toContainText('Do menor para o maior faturamento');
    await expect(card.getByRole('listitem').first()).toContainText('Tornozeleira Estrelas Prata');
  });

  test('pagina o faturamento por cliente', async ({ page }) => {
    await page.goto('/dashboard');
    const card = page.locator('app-card-faturamento-clientes');
    await expect(card.getByRole('row').nth(1)).toContainText('Isabela Lopes');

    await card.getByRole('button', { name: 'Próxima página' }).click();

    await expect(card.getByRole('row').nth(1)).toContainText('Elaine Sales');
  });

  test('ordena o faturamento por cliente', async ({ page }) => {
    await page.goto('/dashboard');
    const card = page.locator('app-card-faturamento-clientes');
    await expect(card.getByRole('row').nth(1)).toContainText('Isabela Lopes');

    await card.getByRole('button', { name: 'Cliente', exact: true }).click();

    await expect(card.getByRole('row').nth(1)).toContainText('Aline Teixeira');
  });

  test('exibe a curva ABC como tabela', async ({ page }) => {
    await page.goto('/dashboard');
    const card = page.locator('app-card-curva-abc');

    await card.getByRole('button', { name: 'Opções do gráfico' }).click();
    await page.getByRole('menuitem', { name: 'Ver como tabela' }).click();

    await expect(card.getByRole('region', { name: 'Dados do gráfico' })).toBeVisible();
    await expect(card.locator('[echarts]')).toHaveCount(0);
  });

  test('exibe a composição da margem em cascata', async ({ page }) => {
    await page.goto('/dashboard');
    const card = page.locator('app-card-composicao-margem');

    await expect(card.locator('[echarts] svg')).toBeVisible();
    // Rótulos das barras: nome e valor, com as deduções em negativo
    for (const rotulo of ['Faturamento', 'Repasse', 'CMV', 'Lucro bruto', /R\$\s50\.285/, /− R\$\s6\.602/, /− R\$\s18\.161/, /R\$\s25\.523/]) {
      await expect(card).toContainText(rotulo);
    }
    await expect(card).toContainText('Margem bruta');
    await expect(card).toContainText('50,76%');
    await expect(page.locator('app-card-margem-bruta')).toContainText('p.p.');

    await card.getByRole('button', { name: 'Opções do gráfico' }).click();
    await page.getByRole('menuitem', { name: 'Ver como tabela' }).click();
    const tabela = card.getByRole('region', { name: 'Dados do gráfico' });
    await expect(tabela.getByRole('row', { name: /Lucro bruto/ })).toContainText(/R\$\s25\.523,19/);
  });

  test('exibe o cálculo do DSI e o DSI por classe', async ({ page }) => {
    await page.goto('/dashboard');
    const card = page.locator('app-card-dias-estoque-detalhe');

    await expect(card).toContainText(/Estoque atual \(custo\)\s*R\$\s15\.850/);
    await expect(card).toContainText(/CMV do período\s*R\$\s18\.161/);
    await expect(card).toContainText(/dias analisados\s*90/);
    await expect(card).toContainText(/DSI\s*79 dias/);

    const classes = card.getByRole('list', { name: 'DSI por classe ABC' }).getByRole('listitem');
    await expect(classes).toHaveText([/A\s*40 dias/, /B\s*94 dias/, /C\s*591 dias/]);
  });

  test('filtra o DSI e a idade do estoque pela revendedora', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('app-card-dias-estoque-detalhe')).toContainText(/DSI\s*79 dias/);

    await page.getByLabel('Revendedor').fill('Ana');
    await page.getByRole('option', { name: 'Ana Costa' }).click();

    // Só o estoque da maleta e as vendas dela: o estoque do DSI é o total das faixas de idade
    await expect(page.locator('app-card-dias-estoque')).toContainText('35 dias');
    await expect(page.locator('app-card-dias-estoque-detalhe')).toContainText(/Estoque atual \(custo\)\s*R\$\s1\.665/);
    await expect.poll(async () => (await totaisIdadeEstoque(page)).pecas).toBe(80);
    expect(Math.abs((await totaisIdadeEstoque(page)).valor - 1665)).toBeLessThanOrEqual(3);
  });

  test('exibe a idade do estoque por faixa, somando as peças sem giro', async ({ page }) => {
    await page.goto('/dashboard');
    const card = page.locator('app-card-idade-estoque');

    await expect(card).toContainText('Posição atual · não segue o filtro de período');
    const faixas = card.getByRole('list', { name: 'Dias desde a última saída, por faixa' }).getByRole('listitem');
    await expect(faixas).toHaveText([/^0–30 dias/, /^31–60 dias/, /^61–90 dias/, /^91–180 dias/, /^Mais de 180 dias/, /^Nunca vendido/]);
    await expect(card.getByRole('link')).toHaveCount(0);

    // A idade usa a data do servidor (o relógio do navegador é fixo): as faixas mudam com o tempo, mas não os totais
    // Valor somado das faixas já arredondadas: tolera a diferença de arredondamento
    const totais = await totaisIdadeEstoque(page);
    expect(totais.pecas).toBe(826);
    expect(Math.abs(totais.valor - 15850)).toBeLessThanOrEqual(3);
    await expect(page.locator('app-card-pecas-sem-giro')).toContainText(`${totais.pecasSemGiro.toLocaleString('pt-BR')} peças`);
  });

  test('exibe aviso quando não há vendas no período', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-01T12:00:00-03:00'));
    await page.goto('/dashboard');

    await expect(page.locator('app-card-ticket-medio')).toContainText('0 vendas');
    await expect(page.locator('app-card-curva-abc')).toContainText('Nenhuma venda no período.');
    await expect(page.locator('app-card-produtos-por-classe')).toContainText('Nenhuma venda no período.');
    await expect(page.locator('app-card-faturamento-clientes')).toContainText('Nenhuma venda no período.');
    await expect(page.locator('app-card-composicao-margem')).toContainText('Nenhuma venda no período.');
    await expect(page.locator('app-card-dias-estoque')).toContainText('Sem vendas');
    await expect(page.locator('app-card-dias-estoque-detalhe')).toContainText('Nenhuma venda no período: o DSI não é calculado.');
    // Posição atual: o estoque aparece mesmo sem vendas no período
    await expect(page.locator('app-card-idade-estoque').getByRole('listitem')).toHaveCount(6);
  });

  test('exibe erro nos cards de estoque quando a API falha', async ({ page }) => {
    await page.route('**/api/dashboard/idade-estoque*', route => route.fulfill({ status: 500 }));
    await page.goto('/dashboard');

    await expect(page.locator('app-card-idade-estoque')).toContainText('Não foi possível carregar.');
    await expect(page.locator('app-card-pecas-sem-giro')).toContainText('Não foi possível carregar.');
    await expect(page.locator('app-card-dias-estoque-detalhe')).toContainText(/DSI\s*79 dias/);
  });

  test('exibe erro no card quando a API falha', async ({ page }) => {
    await page.route('**/api/dashboard/ticket-medio?*', route => route.fulfill({ status: 500 }));
    await page.goto('/dashboard');

    await expect(page.locator('app-card-ticket-medio')).toContainText('Não foi possível carregar.');
    await expect(page.locator('app-card-margem-bruta')).toContainText('50,76%');
  });
});

test('visitante sem login é enviado para o login', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/login$/);
});

test('revendedor não acessa o dashboard', async ({ page }) => {
  await entrar(page, 'ana.costa');
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/login$/);
});
