# Mass Factory — massa de testes centralizada

## O que é

A **Mass Factory** é a camada que concentra geração e seleção de dados de teste, no mesmo espírito do **Page Object Model (POM)**:

| Camada | Responsabilidade | Não faz |
| --- | --- | --- |
| **POM** (`support/pages/*.page.js`) | Interagir com a UI (cliques, campos, asserts de tela) | Inventar e-mails/senhas de negócio |
| **Mass Factory** (`support/data/*`) | Gerar / selecionar massa e perfis | Clicar na página |
| **Steps** (`.steps.js`) | Orquestrar BDD (Given/When/Then) | Duplicar Faker em cada arquivo |
| **Utilitário de aprovação** (`regras_aprovacao.mjs`) | Regras 70% / 80% | Gerar cadastro |

## Arquivos

- `cypress/support/data/massas.mjs` — nomes, e-mails únicos, senhas fictícias, negativos e fronteiras
- `cypress/support/data/perfis.mjs` — perfis lógicos + `cy.env()` (Cypress 16)

## Diferença prática

```text
Cenário Gherkin
    → step_definitions (cola BDD)
        → massas / perfis   ← dados
        → pages             ← UI
        → cy.login(perfil)  ← autenticação via perfis
```

## Como gerar uma massa (cadastro novo)

```js
import { gerarMassaCadastroPositiva } from "../../support/data/massas.mjs";

const { nome, email, senha } = gerarMassaCadastroPositiva();
// exige emailDomain em cypress.env.json (domínio autorizado)
```

Configure no `cypress.env.json` local (não versionado):

```json
{
  "emailDomain": "dominio-autorizado.do.time"
}
```

Não assuma que `@exemplo.test` será aceito pelo backend.

## Como selecionar um perfil (conta persistida)

```js
import { carregarCredenciais } from "../../support/data/perfis.mjs";

carregarCredenciais("alunoCompleto").then(({ email, password }) => {
  // usar nos commands / steps — valores só no callback
});
```

Perfis: `login`, `emailJaCadastrado`, `alunoCompleto`, `alunoFasePendente`, `alunoReprovado`.

`cy.login()` e `cy.login("alunoFasePendente")` já passam por essa camada.

## E-mail já cadastrado

A validação de duplicidade usa **apenas o e-mail** existente.

No formulário, senha e confirmação vêm da Mass Factory (fictícias e iguais).
**Não** é necessário informar a senha real da conta no `cypress.env.json` para esse cenário.

```json
"emailJaCadastrado": {
  "email": "conta.ja.existente@dominio-autorizado.do.time"
}
```

## Reutilização e estado

| Tipo de massa | Reutilização | Cuidado |
| --- | --- | --- |
| Cadastro novo | Sempre **nova** (e-mail único) | Domínio autorizado; evita colisão entre os 5 integrantes |
| Login | Pode reutilizar a mesma conta | Estado estável (acesso ao painel) |
| Exames / Final | Contas dedicadas por perfil | Validar estado **antes** (`CERTIQA_MASS_CONFIRMED=1`); progresso **não** restaura sozinho |
| Conta mutável | Evitar uso concorrente | Combinar no chat quem usa qual conta |

Reposição: após suíte mutável, o time deve repor estados (fases/final) manualmente ou com contas sobressalentes. Ver também `docs/PRECONDICOES-E2E.md`.

## Exemplos de integração

### Cadastro (já integrado)

```js
And("preencho os demais campos com dados fictícios", () => {
  const { email, senha } = gerarMassaCadastroPositiva();
  // ... type nos campos do POM/seletores
});
```

### Login / fases / final (via command)

```js
cy.login(); // perfil login
cy.login("alunoCompleto");
```

## Testes isolados

```powershell
npm run test:unit
# inclui tests/mass-factory.test.mjs
```
