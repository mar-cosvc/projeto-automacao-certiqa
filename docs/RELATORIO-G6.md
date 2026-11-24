# Relatório G6 — Mass Factory centralizada

**Branch:** `fix/certiqa-g5-e2e-gates-20261124` (sobre G5 `9c5774e`)
**Responsável:** Marcos Vinícius Carneiro
**Travas:** sem commit/push; sem AUTH/MUTATING; sem criação de contas

## Arquivos criados

- `cypress/support/data/massas.mjs`
- `cypress/support/data/perfis.mjs`
- `tests/mass-factory.test.mjs`
- `docs/MASS-FACTORY.md`
- `docs/RELATORIO-G6.md`

## Arquivos modificados

- `cadastro.steps.js` — usa Mass Factory
- `commands.js` — `cy.login` via perfis
- `login.steps.js` / `exames_fase.steps.js` / `exame_final.steps.js` — comentários de integração
- `scripts/check-env.mjs` — `emailJaCadastrado` só e-mail; `emailDomain`
- `cypress.env.example.json` — `emailDomain`; password opcional em emailJa
- `package.json` — unit inclui mass-factory
- `README.md` — link Mass Factory

## Cenários preservados

Auditoria Gherkin: 75 defs, 133 steps, 0 unmatched/duplicatas.
Nenhum `.feature` removido ou esvaziado.

## Testes executados

| Comando | Resultado |
| --- | --- |
| `test:static` | PASS |
| `test:unit` | PASS **39/39** (regras + gates + mass factory) |
| `test:smoke` | PASS 2/2 |
| `test:all` (sem flags) | PASS×3 + HOLD×4 |

## Pendências E2E

- Configurar `emailDomain` autorizado real
- Substituir placeholders de contas
- Confirmar estados + `CERTIQA_MASS_CONFIRMED` antes de mutáveis

## Parecer vs G5

Compatível: guards/HOLD/BLOCK inalterados em espírito; Mass Factory alimenta steps/commands sem contornar G5.
Pronto para revisão local; publicação (commit/PR) sob autorização futura.
