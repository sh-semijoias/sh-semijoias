# Frontend — SH Semijoias

> Parte do projeto [SH Semijoias](../../README.md).

SPA construída com Angular 21 usando standalone components.

## Tecnologias

- **Angular 21** — framework principal (standalone components, sem NgModule)
- **Angular Material 21** — biblioteca de componentes UI
- **Tailwind CSS 4** — utilitários de estilo
- **Vitest** — testes unitários
- **Playwright** — testes e2e

## Pré-requisito

- [Node.js 22+](https://nodejs.org/)

## Rodando

```bash
npm install
npm start       # dev server em http://localhost:4200
```

## Comandos

| Comando | Descrição |
|---|---|
| `npm start` | Inicia o servidor de desenvolvimento |
| `npm test` | Executa os testes com Vitest |
| `npm run e2e` | Executa os testes e2e com Playwright contra a API real (requer Docker; sobe API e frontend num banco `sh_semijoias_e2e` recriado com `scripts/seed-dados-teste.sql`). No NixOS, rode dentro do `nix develop`, que fornece os navegadores. Cada teste gera um print em `test-results/`. Para demonstração, `SLOWMO=500 npm run e2e -- --headed` abre o navegador com 500 ms entre as ações |
| `npm run build` | Gera o build de produção em `dist/` |
| `npm run watch` | Build incremental em modo desenvolvimento |

## Estrutura

```
src/app/
├── core/       → Serviços singleton, guards e interceptors
├── pages/      → Componentes de página
└── shared/     → Componentes, pipes e diretivas reutilizáveis
```

## Estilo e tema

O app suporta tema **claro e escuro**, controlado pelo `AppComponent` e persistido em `localStorage`. O estilo é composto por:

- Angular Material para componentes
- Tailwind CSS para utilitários via `src/tailwind.css`
- SCSS por componente para personalizações específicas

## Responsividade

Breakpoint mobile em **600px**, gerenciado pelo `MediaMatcher` do Angular CDK no `AppComponent`.
