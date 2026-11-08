import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: {
    baseURL: 'http://localhost:4200',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    screenshot: 'on',
    // A rolagem fica num contêiner interno do layout: fullPage não captura o dashboard inteiro
    viewport: { width: 1280, height: 2300 },
    // Atraso em ms entre as ações, para demonstração: SLOWMO=500 npm run e2e -- --headed
    launchOptions: { slowMo: Number(process.env.SLOWMO ?? 0) },
  },
  webServer: [
    {
      command: 'bash ../../scripts/e2e-api.sh',
      url: 'http://localhost:5224/api/auth/me',
      timeout: 300_000,
    },
    {
      command: 'npm start',
      url: 'http://localhost:4200',
      timeout: 120_000,
    },
  ],
});
