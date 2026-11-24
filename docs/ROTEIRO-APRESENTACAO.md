# Roteiro de Apresentação — CertiQA (≈ 8–12 min)

**Data:** 24/11/2026
**Projeto:** Automação E2E CertiQA — QA PRO

---

## 1. Contexto (1 min)

- Plataforma: CertiQA (Qazando) — estudos para certificações CTFL e Agile Tester.
- Objetivo acadêmico: suíte colaborativa em **Cypress + Cucumber (BDD)**.
- Entrega: Login, Cadastro, Exames de Fase e Exame Final na mesma `main`.

---

## 2. Trabalho colaborativo (2 min)

Mostrar o fluxo:

```text
feature/*  →  Pull Request  →  revisão  →  merge na main
```

| PR | Entrega |
| ---: | --- |
| #1 | Exames de Fase (Dalila) |
| #4 | Exames de Fase (Pedro) |
| #5 | Exame Final |
| #3 | Cadastro (Babiluna) |

Citar SHA de referência: `d84d82b`
Papel de Marcos: revisão, resolução de conflitos, Cypress 16 / `cy.env`, regra 80%, estabilização G4.

---

## 3. Desafios (1–2 min)

- Conflitos em Login / commands entre PRs de fases.
- Alinhar critério de aprovação do Exame Final (**80%**, fronteiras 31/32/33).
- Massa de dados compartilhada e risco de colisão.
- Não expor credenciais no Git.

---

## 4. Demonstração (3–4 min)

Ordem sugerida no PowerShell:

```powershell
npm ci
npm run test:static
npm run test:unit
npm run test:smoke
```

Se houver contas autorizadas e combinadas:

```powershell
$env:CERTIQA_ALLOW_AUTH = "1"
$env:CERTIQA_ALLOW_MUTATING = "1"
npm run test:login
# opcional: test:cadastro / test:fases / test:final ou test:all
```

Na fala, destacar:

1. Feature Gherkin legível.
2. Step + Page Object.
3. `cy.login()` / perfis.
4. HOLD quando falta autorização (honestidade do resultado).

---

## 5. Resultados (1–2 min)

- Inventário: **60** cenários Gherkin expandidos (não confundir com PASS E2E).
- Unitário: regra **70%** fases e **80%** final comprovada.
- Smoke READ_ONLY executável sem senha.
- Evidências em `evidence/suite-*/summary.json`.

Deixar claro o que foi **PASS**, o que ficou **HOLD** e o que não foi executado.

---

## 6. Conclusão (1 min)

- Integração das contribuições preservada.
- Time consegue instalar, configurar e rodar a mesma suíte.
- Próximo passo: PR de estabilização após revisão do relatório (sem push nesta etapa G4).

**Encerramento:** agradecer o time e abrir para perguntas.
