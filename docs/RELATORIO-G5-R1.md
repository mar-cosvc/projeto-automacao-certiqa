# Relatório G5-R1 — Preparação E2E integrada

**Data:** 24/11/2026
**Responsável:** Marcos Vinícius Carneiro
**Base main:** `9cc07aa` (inclui PR #6 estabilização)
**Branch de trabalho:** `fix/certiqa-g5-e2e-gates-20261124`
**Travas:** sem commit/push/merge; sem AUTH mutável; sem `CERTIQA_ALLOW_MUTATING`

---

## Flags de status

| Flag | Valor |
| --- | --- |
| `G5_ENV_STATUS` | **PASS** (`NODE_OPTIONS=--use-system-ca`) |
| `G5_NPM_CI_STATUS` | **PASS** |
| `G5_CYPRESS_VERSION` | **16.3.0** (package = binary) |
| `G5_SMOKE_STATUS` | **PASS** (2/2) |
| `G5_AUTH_CONFIG_STATUS` | **STRUCTURE_OK_PLACEHOLDERS** |
| `G5_PROFILE_READINESS` | **NOT_READY** (domínio `@exemplo.test` em todos os perfis) |
| `G5_MUTATING_GATE_STATUS` | **HOLD** (flags off + proteções ativas) |
| `G5_GIT_BRANCH` | `fix/certiqa-g5-e2e-gates-20261124` |
| `G5_FILES_CHANGED` | ver lista abaixo |
| `G5_READY_FOR_AUTH` | **NO** |
| `G5_READY_FOR_MUTATING` | **NO** |

---

## Diagnóstico das falhas anteriores

| Problema | Causa | Mitigação G5 |
| --- | --- | --- |
| `UNABLE_TO_VERIFY_LEAF_SIGNATURE` | CA corporativa/intermediária não confiada pelo OpenSSL do Node no sandbox | Usar `NODE_OPTIONS=--use-system-ca` no Windows; **não** desabilitar SSL |
| Cypress binário ausente após `npm ci` | `allowScripts` bloqueando postinstall | `npx cypress install` + `npx cypress verify` → 16.3.0 |
| Orquestrador seguia após FAIL de infra | Sem gate de bloqueio | `BLOCK` em AUTH/MUTATING se static/unit/smoke FAIL |
| `test:cadastro` etc. contornavam suíte | Scripts npm diretos | `scripts/guard-stage.mjs` nos scripts individuais |
| Flags ≠ massa válida | Só checava presença de campos | `--reject-placeholders` + `CERTIQA_MASS_CONFIRMED` |

---

## Correções realizadas (somente branch G5)

- `scripts/suite-gates.mjs` — regras puras (testáveis)
- `scripts/guard-stage.mjs` — guarda dos comandos individuais
- `scripts/run-suite.mjs` — BLOCK pós-infra, prechecks por etapa, MASS
- `scripts/check-env.mjs` — `--reject-placeholders` (sem imprimir senhas)
- `tests/suite-gates.test.mjs` — 15 testes de proteção
- `docs/PRECONDICOES-E2E.md` — matriz de pré-condições
- `package.json` — unit inclui gates; login/cadastro/fases/final passam pelo guard

**Não** removidos cenários dos integrantes.

---

## Pré-condições ainda ausentes

1. Contas autorizadas com domínio aceito pelo backend (substituir `@exemplo.test`).
2. Confirmação manual dos estados: `alunoCompleto`, `alunoFasePendente`, `alunoReprovado`.
3. `emailJaCadastrado` real (não placeholder).
4. Autorização explícita do time para AUTH e, depois, MUTATING + `CERTIQA_MASS_CONFIRMED=1`.

---

## Testes executados (resultados reais)

| Comando | Resultado |
| --- | --- |
| `npm ci` (+ system CA) | PASS |
| `npx cypress verify` | PASS 16.3.0 |
| `npm run test:static` | PASS |
| `npm run test:unit` | PASS (24/24) |
| `npm run test:smoke` | PASS (2/2) |
| `npm run test:all` (sem flags) | PASS infra + HOLD E2E (`suiteFunctionalStatus=HOLD`) |
| `guard-stage login/cadastro` | HOLD exit 2 |
| Cadastro/Fases/Final mutáveis | **não executados** |

Deps confirmadas: Cypress 16.3.0, `@badeball/...` 28.0.1, `@bahmutov/...` 2.2.8, `@faker-js/faker` 10.6.0.

---

## Riscos

- Placeholders em `cypress.env.json` local → E2E autenticado falharia ou poluiria com dados inválidos.
- Comandos mutáveis individuais agora exigem flags; documentação deve ser seguida pelo time.
- 4 vulnerabilidades moderate transitivas (inalteradas; sem `audit fix --force`).

---

## Próximo procedimento recomendado (G5-R2)

1. Time provisiona contas reais autorizadas no `cypress.env.json` (fora do Git).
2. Validar: `node scripts/check-env.mjs --reject-placeholders` → exit 0.
3. Confirmar estados na UI (matriz em `docs/PRECONDICOES-E2E.md`).
4. Executar Login: `$env:CERTIQA_ALLOW_AUTH=1; npm run test:login`
5. Somente após OK e autorização: MUTATING + `CERTIQA_MASS_CONFIRMED=1` e `npm run test:all`
6. Commit/PR da branch G5 **após** revisão (não feito neste gate).
