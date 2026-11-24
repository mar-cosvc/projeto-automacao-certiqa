# Relatório Técnico — CERTIQA | G4 / G4-R1 (Estabilização)

**Responsável:** Marcos Vinícius Carneiro
**Data:** 23–24/11/2026
**Workspace (local do integrador):** `C:\Users\marqu\OneDrive\Documentos\_QAzando\projeto-automação-certiqa`
**Nota:** o README e os scripts usam caminhos relativos ao clone; o time não depende deste path absoluto.
**Travas respeitadas:** sem commit, push, merge remoto, force push, reset --hard, git clean, deploy ou testes mutáveis sem autorização.

## Parecer G4-R1 (pré-publicação)

| Flag | Valor |
| --- | --- |
| `G4_PUBLICATION_GATE` | **PASS** |
| `G4_E2E_STATUS` | **HOLD** |
| `READY_FOR_COMMIT` | **YES** |

Correções R1 aplicadas: whitespace do README (`git diff --check` limpo), `suiteFunctionalStatus` no orquestrador, docs de evidência/5º integrante/rotação de credenciais.

---

## 1. HEAD inicial e final

| Momento | SHA |
| --- | --- |
| HEAD inicial (main de referência) | `d84d82bb7a95cc72c1c64bb9a0e0543dbb4269b5` |
| HEAD final (ainda sem commit G4) | `d84d82bb7a95cc72c1c64bb9a0e0543dbb4269b5` |

Alterações G4 permanecem **apenas no working tree** da branch de estabilização, aguardando autorização de commit/PR.

---

## 2. Branch

- Esperada / atual: `review/certiqa-estabilizacao-20261124`
- Origin: `https://github.com/mar-cosvc/projeto-automacao-certiqa.git`
- Working tree: modificações locais + arquivos novos (não commitados)

---

## 3. Arquivos modificados / novos

### Modificados

- `.gitignore` — ignora `evidence/`
- `README.md` — manual operacional final
- `package.json` — scripts padronizados + engines
- `cypress/e2e/step_definitions/login.steps.js` — step aditivo da home (smoke)

### Novos

- `cypress/e2e/features/smoke_readonly.feature`
- `cypress/support/utils/regras_aprovacao.mjs`
- `tests/regras_aprovacao.test.mjs`
- `scripts/audit-gherkin-steps.mjs`
- `scripts/check-env.mjs`
- `scripts/run-suite.mjs`
- `docs/MASSA-E-CONFIGURACAO.md`
- `docs/RELATORIO-FINAL-CERTIQA.md`
- `docs/ROTEIRO-APRESENTACAO.md`
- `docs/RELATORIO-TECNICO-G4.md` (este arquivo)

**Não** foram substituídos Page Objects nem features originais das PRs #1/#3/#4/#5.

---

## 4. Novos scripts npm

| Script | Função |
| --- | --- |
| `test:static` | Auditoria Gherkin × steps |
| `test:unit` | Regras 70%/80% e fronteiras 31/32/33 |
| `test:smoke` | Smoke READ_ONLY |
| `test:login` | Feature Login |
| `test:cadastro` | Feature Cadastro (mutável) |
| `test:fases` | Exames de Fase |
| `test:final` | Exame Final |
| `test:all` | Orquestrador sequencial |
| `check:env` | Pré-checagem de `cypress.env.json` |

Ordem de `test:all`: static → unit → smoke → login → cadastro → fases → final.

---

## 5. Comandos realmente executados

```powershell
# Preflight Git
git rev-parse HEAD
git status
git log --oneline / --merges

# Dependências
npm ci                    # OK com NODE_OPTIONS=--use-system-ca
npx cypress install

# Verificações
npm run test:static
npm run test:unit
npm run test:smoke
npm run test:all          # sem CERTIQA_ALLOW_*
npm audit
```

**Não executados (sem autorização / sem `cypress.env.json`):**
`test:login`, `test:cadastro`, `test:fases`, `test:final` como E2E autenticado/mutável.

---

## 6. Resultados

### Gate 0 — Preflight

| Check | Resultado |
| --- | --- |
| Workspace autorizado | PASS |
| Branch | PASS |
| Origin | PASS |
| HEAD `d84d82b…` | PASS |
| Working tree limpa (início) | PASS |
| PRs #1, #4, #5, #3 no histórico | PASS |
| Features/steps/pages/fixtures presentes | PASS |

### Inventário (Gate 1)

≈ **60** cenários Gherkin expandidos (inclui smoke). Auditoria estática: **75** step defs, **133** passos de feature, **0** duplicatas, **0** unmatched.

### Execução G4

| Etapa | Status | Evidência |
| --- | --- | --- |
| static | **PASS** | exit 0 |
| unit | **PASS** | 9/9 testes |
| smoke | **PASS** | 2/2 Cypress |
| login | **HOLD** | sem `CERTIQA_ALLOW_AUTH` |
| cadastro | **HOLD** | sem `CERTIQA_ALLOW_MUTATING` |
| fases | **HOLD** | sem AUTH+MUTATING |
| final | **HOLD** | sem AUTH+MUTATING |

Sumário local (gitignored): `evidence/suite-2026-11-24T02-45-17-997Z/summary.json`
Arquivos físicos: `summary.json`, `static.log`, `unit.log`, `smoke.log` (sem credenciais).
Contagem: PASS=3, FAIL=0, SKIP=0, HOLD=4.
`processExit=0` com status funcional **HOLD** (orquestração ok ≠ E2E completo PASS).

### Como compartilhar evidências (sem versionar `evidence/`)

1. Encaminhar só o `summary.json` sanitizado no chat do grupo; ou
2. Colar `counts` + `suiteFunctionalStatus` + `stages[].status` na ata; ou
3. Screenshot do console.
Não anexar vídeos Cypress nem `cypress.env.json` em PRs.

---

## 7. Pendências

1. Autorização do time para preencher `cypress.env.json` e liberar AUTH/MUTATING.
2. Homologação E2E completa (login → cadastro → fases → final) com contas provisionadas.
3. Validar se `@exemplo.test` é aceito em produção de cadastro real (já usado nos steps).
4. Commit + PR de estabilização **somente após** revisão deste relatório.
5. Clarificar creditação do “quinto integrante” (git local mostra 4 autores distintos).

---

## 8. Situação de segurança

- `cypress.env.json` **ausente** neste ambiente (correto).
- Exemplo versionado só com placeholders.
- `npm audit --omit=dev`: 0 vulnerabilidades.
- `npm audit` completo: **4 moderate** em cadeia `glob`/`minimatch` via `@badeball/cypress-cucumber-preprocessor` / `mocha`. Correção via `audit fix --force` **baixaria** o preprocessor para v15 (breaking) — **não aplicada**. Overrides existentes de `diff` / `serialize-javascript` mantidos.
- Sem publicação de segredos.
- **Rotação:** commits históricos tocam a palavra `password` em arquivos de teste/docs; tratar qualquer credencial real que tenha vazado no passado como comprometida e rotacionar nas contas de homologação.

---

## 9. Diferenças em relação a G1/G2

Referência somente leitura: `C:\Users\marqu\Dev\certiqa-integracao-20261123` (`18bdb9b`, branch `integration/certiqa-unificada-20261123`).

| Item G1/G2 | Ação na main final |
| --- | --- |
| `regras_aprovacao` + testes unitários | Incorporados de forma **aditiva** (`.mjs`) |
| `audit-gherkin-steps.mjs` | Incorporado |
| `commands.js` G1/G2 (sempre `alunoCompleto`) | **Não** substituído — main mantém `cy.login()` flat + `cy.login(tipo)` (PRs aprovadas) |
| `cypress.env.example` G1/G2 (sem flat email) | Main preserva formato flat + perfis; docs explicam |
| Page Objects / features G1/G2 | **Não** copiados por cima da main |

---

## 10. Parecer de prontidão para publicação

**Condicional — pronto para revisão de PR, não para merge automático.**

A branch de estabilização está apta a virar PR **depois** de:

1. Revisão deste relatório técnico e do acadêmico.
2. Commit autorizado pelo responsável.
3. (Recomendado) pelo menos uma execução AUTH com massa real antes da apresentação.

O código das contribuições originais permanece preservado; a camada G4 é operacional/documental.

---

## 11. Instruções para os cinco integrantes

```powershell
git checkout main
git pull origin main
# após merge da PR de estabilização:
npm ci
Copy-Item cypress.env.example.json cypress.env.json
# preencher com contas AUTORIZADAS do time
npm run check:env
npm run test:static
npm run test:unit
npm run test:smoke

# Suíte completa (somente com autorização do time):
$env:CERTIQA_ALLOW_AUTH = "1"
$env:CERTIQA_ALLOW_MUTATING = "1"
npm run test:all
```

Comparar `evidence/suite-*/summary.json` entre máquinas.
Não rodar fases/final em paralelo na mesma conta.
Detalhes: `docs/MASSA-E-CONFIGURACAO.md` e `README.md`.
