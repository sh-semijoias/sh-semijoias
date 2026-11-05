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

  test('exibe aviso quando não há vendas no período', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-01T12:00:00-03:00'));
    await page.goto('/dashboard');

    await expect(page.locator('app-card-ticket-medio')).toContainText('0 vendas');
    await expect(page.locator('app-card-curva-abc')).toContainText('Nenhuma venda no período.');
    await expect(page.locator('app-card-produtos-por-classe')).toContainText('Nenhuma venda no período.');
    await expect(page.locator('app-card-faturamento-clientes')).toContainText('Nenhuma venda no período.');
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
