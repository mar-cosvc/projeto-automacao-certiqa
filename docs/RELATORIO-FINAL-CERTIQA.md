# Relatório Final — CertiQA (Automação de Testes)

**Curso:** QA PRO — Qazando
**Projeto:** Automação E2E da plataforma CertiQA
**Data de apresentação:** 24/11/2026
**Responsável pela revisão / estabilização G4:** Marcos Vinícius Carneiro
**Main de referência integrada:** `d84d82bb7a95cc72c1c64bb9a0e0543dbb4269b5`
**Branch de estabilização:** `review/certiqa-estabilizacao-20261124`

---

## 1. Introdução

Este relatório documenta o trabalho colaborativo de automação de testes do site CertiQA ([https://certiqa.qazando.com.br/](https://certiqa.qazando.com.br/)), desenvolvido como projeto final do curso QA PRO. As contribuições individuais foram submetidas por Pull Requests, revisadas e mergeadas na `main`. Em seguida, a estabilização G4 padronizou scripts de execução, documentação e verificações estáticas sem reescrever as automações aprovadas.

---

## 2. Objetivo geral e específicos

### Objetivo geral

Entregar uma suíte BDD integrada, reproduzível e segura (sem segredos no repositório), cobrindo Login, Cadastro, Exames de Fase e Exame Final.

### Objetivos específicos

1. Integrar contribuições via PRs na mesma `main`.
2. Preservar o código original aprovado.
3. Padronizar instalação, configuração e comandos npm.
4. Validar regras de aprovação (70% fases / 80% final) de forma isolada.
5. Separar smoke READ_ONLY de E2E autenticado e mutável.
6. Produzir evidências e instruções para o time executar e apresentar.

---

## 3. Metodologia

1. **BDD:** cenários em Gherkin (`.feature`) mapeados para steps Cypress.
2. **Page Object:** encapsulamento de seletores e fluxos em `cypress/support/pages/`.
3. **GitHub Flow:** branch por feature → PR → revisão → merge na `main`.
4. **Estabilização G4:** inventário, aproveitamento pontual de utilitários G1/G2, scripts npm, pré-checagem de ambiente, relatórios.
5. **Execução controlada:** testes mutáveis somente com autorização explícita (`CERTIQA_ALLOW_*`).

---

## 4. Integrantes e contribuições comprovadas

Autores identificados no histórico Git das PRs mergeadas (não se inventam participações além do comprovável):

| Integrante (git) | Contribuição comprovada | PR / evidência |
| --- | --- | --- |
| **Dalila** (`Dalila <dalilaxavier.tech@gmail.com>`) | Exames de Fase (base CTFL / Agile) | PR **#1** — merge `941e7446cd443f26a134b9a2951297eb6e62b755` (`feature/exames-fase-dalila`) |
| **Pedro** (`“maxpedrohd”`) | Exames de Fase (evolução) e commits de Exame Final | PR **#4** — merge `0172f087f0eb740c874166c4a6a176537438794b` (`feature/exames-fase-pedro1`); commits em Exame Final (ex.: `68db553`) |
| **Bárbara Luna / Babiluna** | Cadastro | PR **#3** — merge `d84d82bb7a95cc72c1c64bb9a0e0543dbb4269b5` (`feature/testes-cadastro`) |
| **Marcos Vinícius Carneiro** | Revisões, merges, correções de integração (Cypress 16 / `cy.env`, regra 80%, equalização de cadastro), estabilização G4 | Merges das PRs #1/#4/#5/#3; commits `90c9fea`, `7115533`, `57b07e5`, `5e75bf5` |

**PR #5 — Exame Final:** merge `5dd239e7a4ad9fdc1b2995ba9ee706289d849cd7` (`feature/exame-final-mergeada`). No histórico Git local, os commits de automação do Exame Final aparecem atribuídos a `“maxpedrohd”`, com estabilização da regra **80%** por Marcos (`57b07e5`).

> **Limitação de rastreabilidade:** o time declara cinco integrantes, mas o histórico Git desta `main` comprova apenas **quatro** identidades autorais distintas (Dalila, maxpedrohd, Bárbara Luna, Marcos). O nome e a contribuição do quinto integrante **não foram inventados**. Campo reservado para identificação posterior (preencher só com evidência: commit, PR ou ata do time):
>
> | Campo | Valor |
> | --- | --- |
> | Quinto integrante (nome) | _a identificar_ |
> | Contribuição | _a identificar_ |
> | Evidência (SHA/PR/ata) | _pendente_ |

---

## 5. Tecnologias

- JavaScript / Node.js (>= 18)
- Cypress ^16.3.0
- `@badeball/cypress-cucumber-preprocessor` ^28
- `@bahmutov/cypress-esbuild-preprocessor`
- `@faker-js/faker` (massa de cadastro)
- Overrides de dependências transitivas (`diff`, `serialize-javascript`) para hardening

---

## 6. Arquitetura da automação

```text
.feature (negócio)
    → step_definitions (orquestração BDD)
        → commands.js (cy.login / cy.login(tipoUsuario))
        → pages/*.page.js (UI + regras embutidas 70%/80%)
        → fixtures/*.json (questões / certificações)
```

Camada aditiva G4 (sem substituir Page Objects aprovados):

- `cypress/support/utils/regras_aprovacao.mjs`
- `tests/regras_aprovacao.test.mjs`
- `scripts/audit-gherkin-steps.mjs`
- `scripts/check-env.mjs` / `scripts/run-suite.mjs`

---

## 7. Estratégia BDD

- Idioma: português (`# language: pt`)
- Uso de `Cenário` e `Esquema do Cenário` com tabelas `Exemplos`
- Feature dedicada `smoke_readonly.feature` para smoke sem autenticação
- Steps compartilhados entre features quando o texto Gherkin coincide (ex.: menu Certificações)

---

## 8. Funcionalidades automatizadas

### Login (2 cenários)

- Acesso READ_ONLY à página de login
- Login com credenciais de `cypress.env.json` (`cy.login()`)

### Cadastro (12 cenários)

- Sucesso, validações de nome/e-mail/senha, e-mail já cadastrado
- E-mails únicos via timestamp + Faker (`@exemplo.test`)

### Exames de Fase (≈ 33 expandido)

- CTFL (6 fases) e Agile Tester (3 fases)
- Explicações pós-exame, múltipla escolha, aprovação 70%, superior a 70% (80% de acertos), reprovação/refazer, conclusão e liberação do exame final

### Exame Final (11 expandido)

- Bloqueios com `alunoFasePendente` / `alunoReprovado`
- Conteúdo transversal das fases, tempo limite
- Fronteiras inferior / igual / superior a **80%**

---

## 9. Histórico das PRs

| PR | Branch origem | Merge SHA | Tema |
| ---: | --- | --- | --- |
| #1 | `feature/exames-fase-dalila` | `941e7446…` | Exames de Fase (Dalila) |
| #4 | `feature/exames-fase-pedro1` | `0172f087…` | Exames de Fase (Pedro) + conflitos de login |
| #5 | `feature/exame-final-mergeada` | `5dd239e7…` | Exame Final |
| #3 | `feature/testes-cadastro` | `d84d82bb…` | Cadastro (Babiluna) — HEAD atual da main integrada |

Ordem cronológica dos merges: #1 → #4 → #5 → #3.

---

## 10. Revisões técnicas

Durante a integração, destacam-se:

- Compatibilidade Cypress 16 com `cy.env([...]).then(...)` em `commands.js`
- `cy.login()` sem argumento (credenciais flat) e `cy.login(tipoUsuario)` (perfis aninhados)
- Correção da regra de aprovação do Exame Final para **80%**
- Equalização do Cadastro na integração da PR #3
- Overrides de dependências vulneráveis no `package.json`

---

## 11. Conflitos encontrados

- Sobreposição de Login / commands entre PRs de Exames de Fase (#1 e #4)
- Integração do Exame Final com a main já contendo fases
- Equalização de Cadastro após merges anteriores

Resolvidos nos commits de merge/integração (`7115533`, `57b07e5`, `5e75bf5`) sem descartar contribuições aprovadas.

---

## 12. Soluções aplicadas (G4)

1. Inventário fiel de cenários e arquivos.
2. Incorporação **aditiva** de utilitário de regras + testes unitários + auditoria Gherkin (origem G1/G2).
3. Scripts npm padronizados e orquestrador sequencial com HOLD por falta de autorização/ambiente.
4. Documentação de massa (`docs/MASSA-E-CONFIGURACAO.md`) e README operacional.
5. Separação READ_ONLY / AUTH / MUTATING.

---

## 13. Correções de Marcos

Comprovadas no histórico:

- `90c9fea` — regra de aprovação e autenticação Cypress 16 (contexto PR #1)
- `7115533` — integração PR #4 / conflitos de login
- `57b07e5` — estabilização Exame Final em 80%
- `5e75bf5` — equalização Cadastro (PR #3)
- Estabilização G4 nesta branch (scripts, docs, utilitários) — *pendente de PR final após revisão deste relatório*

---

## 14. Evidências dos testes

Local padrão após `npm run test:all`:

- `evidence/suite-<timestamp>/summary.json`
- Logs por etapa (`static`, `unit`, `smoke`, …)
- Artefatos Cypress em `cypress/videos` e `cypress/screenshots` (gitignored)

---

## 15. Resultados reais

Os status admitidos são **PASS**, **FAIL**, **SKIP** e **HOLD**.

Revalidação G4-R1 (máquina do revisor, **sem** `cypress.env.json` e **sem** `CERTIQA_ALLOW_*`), evidência local `evidence/suite-2026-11-24T02-51-12-257Z/summary.json`:

| Etapa | Status | Observação |
| --- | --- | --- |
| `test:static` | **PASS** | 75 defs, 0 unmatched, 0 duplicatas |
| `test:unit` | **PASS** | 9/9 (70%, 80%, fronteiras 31/32/33) |
| `test:smoke` | **PASS** | 2/2 READ_ONLY |
| `test:login` | **HOLD** | sem `CERTIQA_ALLOW_AUTH` |
| `test:cadastro` | **HOLD** | sem `CERTIQA_ALLOW_MUTATING` |
| `test:fases` | **HOLD** | sem AUTH+MUTATING |
| `test:final` | **HOLD** | sem AUTH+MUTATING |

Contagem: PASS=3, FAIL=0, SKIP=0, HOLD=4.
`processExit=0` / `suiteFunctionalStatus=HOLD`.
Nenhum E2E não executado foi apresentado como PASS. A pasta `evidence/` não é versionada; compartilhar só o `summary.json` sanitizado.

> No dia da apresentação, o time pode reexecutar com autorização e anexar novo `summary.json`.

---

## 16. Limitações

- Ambiente compartilhado de homologação.
- Dependência de massas manuais (estados de aluno).
- Possível rejeição de `@exemplo.test` pelo backend.
- Um cenário de status de fases permanece comentado.
- Ferramenta `gh` ausente no ambiente do revisor; metadados via Git.

---

## 17. Vulnerabilidades residuais

- Segredos só são seguros se `cypress.env.json` permanecer local (já no `.gitignore`).
- Overrides reduzem risco em transitivas do Mocha; novas auditorias `npm audit` podem surgir com updates.
- Cadastros automatizados podem poluir o ambiente se executados em massa sem controle.

---

## 18. Lições aprendidas

1. Divisão clara de arquivos por feature reduz conflitos, mas `commands.js` e Page Objects compartilhados exigem coordenação.
2. Regras de negócio (70%/80%) precisam de testes isolados além do E2E.
3. Documentar pré-condições de massa evita falso negativo na demonstração.
4. Não tratar HOLD/SKIP como PASS preserva honestidade acadêmica.

---

## 19. Considerações finais

A `main` integrada concentra Login, Cadastro, Exames de Fase e Exame Final com as correções de revisão já mergeadas. A branch `review/certiqa-estabilizacao-20261124` adiciona a camada de execução padronizada e documentação final. A publicação da PR de estabilização permanece condicionada à revisão deste relatório pelo responsável técnico.
