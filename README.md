# CertiQA — Automação E2E (Cypress + BDD)

Projeto final do curso **QA PRO** (Qazando): suíte colaborativa de testes end-to-end da plataforma [CertiQA](https://certiqa.qazando.com.br/), integrada via Pull Requests e estabilizada para execução reproduzível pelo time.

Repositório: [mar-cosvc/projeto-automacao-certiqa](https://github.com/mar-cosvc/projeto-automacao-certiqa)

---

## 1. Objetivo

Automatizar, em BDD (Gherkin + Cypress), os fluxos críticos:

1. Login
2. Cadastro
3. Exames de Fase (CTFL e Agile Tester)
4. Exame Final

Permitir que todos os integrantes atualizem a mesma `main`, instalem as mesmas dependências, configurem contas autorizadas e comparem evidências.

---

## 2. Tecnologias

| Item | Versão / detalhe |
| --- | --- |
| Node.js | >= 18 (validado com Node 24 LTS local) |
| npm | vem com o Node |
| Cypress | ^16.3.0 |
| Cucumber preprocessor | `@badeball/cypress-cucumber-preprocessor` ^28 |
| Bundler | `@bahmutov/cypress-esbuild-preprocessor` |
| Dados fictícios | `@faker-js/faker` |

---

## 3. Estrutura real

```text
projeto-automacao-certiqa/
├── cypress.config.js
├── cypress.env.example.json          # modelo sem segredos
├── package.json
├── README.md
├── docs/
│   ├── MASSA-E-CONFIGURACAO.md
│   ├── RELATORIO-FINAL-CERTIQA.md
│   ├── RELATORIO-TECNICO-G4.md
│   └── ROTEIRO-APRESENTACAO.md
├── scripts/
│   ├── audit-gherkin-steps.mjs       # auditoria steps × features
│   ├── check-env.mjs                 # pré-checagem de cypress.env.json
│   └── run-suite.mjs                 # orquestrador sequencial
├── tests/
│   └── regras_aprovacao.test.mjs     # unitário 70% / 80% / fronteiras
└── cypress/
    ├── fixtures/
    ├── support/
    │   ├── commands.js               # cy.login() e cy.login(tipo)
    │   ├── e2e.js
    │   ├── pages/
    │   │   ├── exames_fase.page.js
    │   │   └── exame_final.page.js
    │   └── utils/
    │       └── regras_aprovacao.mjs
    └── e2e/
        ├── features/
        │   ├── smoke_readonly.feature
        │   ├── login.feature
        │   ├── cadastro.feature
        │   ├── exames_fase.feature
        │   └── exame_final.feature
        └── step_definitions/
            ├── login.steps.js
            ├── cadastro.steps.js
            ├── exames_fase.steps.js
            └── exame_final.steps.js
```

---

## 4. Features integradas (inventário)

| Feature | Arquivo | Cenários Gherkin (ativos) | Expandidos (com Exemplos) |
| --- | ---: | ---: | ---: |
| Smoke READ_ONLY | `smoke_readonly.feature` | 2 | 2 |
| Login | `login.feature` | 2 | 2 |
| Cadastro | `cadastro.feature` | 12 | 12 |
| Exames de Fase | `exames_fase.feature` | 8 (4 simples + 4 esquemas; 1 cenário comentado) | 33 |
| Exame Final | `exame_final.feature` | 5 esquemas | 11 |
| **Total** | | | **60** |

> Contagem Gherkin ≠ testes efetivamente PASS em homologação. Resultados reais ficam em `evidence/` e no relatório técnico.

Regras de negócio da plataforma CertiQA:

- Exames de Fase: **70%**
- Exame Final: **80%** (40 questões → fronteiras **31 / 32 / 33**)

---

## 5. Instalação (Windows / PowerShell)

```powershell
git clone https://github.com/mar-cosvc/projeto-automacao-certiqa.git
cd projeto-automacao-certiqa
git checkout main
git pull origin main
npm ci
```

Se `npm ci` falhar por lock desatualizado em máquina nova, use `npm install` e alinhe com o time.

---

## 6. Configuração local de ambiente

```powershell
Copy-Item cypress.env.example.json cypress.env.json
notepad cypress.env.json
npm run check:env
```

Detalhes de perfis, pré-condições e colisões: [`docs/MASSA-E-CONFIGURACAO.md`](docs/MASSA-E-CONFIGURACAO.md).

**Não** versione `cypress.env.json`.

---

## 7. Comandos

### Verificações estáticas / unitárias

```powershell
npm run test:static   # auditoria Gherkin × step definitions
npm run test:unit     # regras 70%/80% e fronteiras 31/32/33
```

### Smoke READ_ONLY (sem credenciais)

```powershell
npm run test:smoke    # smoke_readonly.feature (home + login sem autenticar)
```

### E2E por funcionalidade

```powershell
npm run test:login      # AUTH — exige email/password
npm run test:cadastro   # MUTATING — cria contas; e-mail já cadastrado exige perfil
npm run test:fases      # AUTH + MUTATING — altera progresso
npm run test:final      # AUTH + MUTATING — exige perfis de aluno
```

### Suíte sequencial (`test:all`)

Ordem: static → unit → smoke → login → cadastro → fases → final.

Sem autorização explícita, etapas AUTH/MUTATING ficam **HOLD** (não são reportadas como PASS).

Leia no final do log / `summary.json`:

- `processExit` — exit do orquestrador (0 se nenhuma etapa **executada** falhou)
- `suiteFunctionalStatus` — `PASS` | `HOLD` | `FAIL` da suíte como um todo

`processExit=0` com `suiteFunctionalStatus=HOLD` **não** significa que Login/Cadastro/Fases/Final passaram.

```powershell
npm run test:all
```

Com autorização (após combinar contas no time):

```powershell
$env:CERTIQA_ALLOW_AUTH = "1"
$env:CERTIQA_ALLOW_MUTATING = "1"
npm run test:all
```

Interface visual:

```powershell
npm run cy:open
```

---

## 8. Relatórios e evidências

| Artefato | Onde |
| --- | --- |
| Vídeos Cypress | `cypress/videos/` (gitignored) |
| Screenshots de falha | `cypress/screenshots/` (gitignored) |
| Sumário da suíte `test:all` | `evidence/suite-<timestamp>/summary.json` |
| Logs por etapa | `evidence/suite-<timestamp>/*.log` |

A pasta `evidence/` é **local** (está no `.gitignore`). Não versionar vídeos/logs automaticamente.

Para compartilhar resultados com o time de forma segura:

1. Enviar apenas `summary.json` (sem senhas) pelo chat/Drive do grupo, **ou**
2. Copiar os campos `stages` / `counts` / `suiteFunctionalStatus` para a ata da apresentação, **ou**
3. Anexar screenshot do console do `npm run test:all`

Não publicar `cypress.env.json`, vídeos com dados de contas reais, nem dumps de env.

---

## 9. Fluxo colaborativo de PRs

1. Atualizar `main`: `git checkout main; git pull origin main`
2. Branch por tarefa: `git checkout -b feature/sua-tarefa`
3. Editar preferencialmente os arquivos da sua feature
4. Commit no padrão `feat:` / `fix:` / `docs:` / `chore:`
5. `git push -u origin HEAD` e abrir PR para `main`
6. Avisar o time antes e depois do merge

A `main` de referência integrada (PRs #1, #4, #5, #3) é:

`d84d82bb7a95cc72c1c64bb9a0e0543dbb4269b5`

---

## 10. Problemas conhecidos e limitações

- Sem `cypress.env.json`, Login autenticado, Fases e Final não executam.
- Domínio `@exemplo.test` pode ser rejeitado pelo backend; alinhar domínio autorizado com o time.
- Cadastro bem-sucedido e exames **alteram estado** no ambiente compartilhado — evitar execução paralela na mesma conta.
- Cenário comentado em `exames_fase.feature` (“Validar status das fases”) permanece inativo.
- Contagem de cenários Gherkin expandida não implica aprovação E2E de todos os itens na apresentação.
- `gh` CLI pode não estar instalado; metadados de PR neste ciclo foram obtidos via histórico Git.

Documentação acadêmica: [`docs/RELATORIO-FINAL-CERTIQA.md`](docs/RELATORIO-FINAL-CERTIQA.md)
Roteiro da apresentação: [`docs/ROTEIRO-APRESENTACAO.md`](docs/ROTEIRO-APRESENTACAO.md)
Relatório técnico G4: [`docs/RELATORIO-TECNICO-G4.md`](docs/RELATORIO-TECNICO-G4.md)
