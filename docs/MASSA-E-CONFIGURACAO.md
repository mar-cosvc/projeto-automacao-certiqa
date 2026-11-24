# Massa de dados e configuração local

## Arquivo local (não versionado)

```powershell
Copy-Item cypress.env.example.json cypress.env.json
# Edite cypress.env.json com contas AUTORIZADAS do time.
```

`cypress.env.json` está no `.gitignore`. Nunca commite senhas reais.

**Rotação recomendada:** se qualquer senha de teste já apareceu em commit, PR, chat público ou captura de tela versionada no histórico do repositório, **troque a senha na plataforma** e atualize apenas o `cypress.env.json` local. Placeholders do `cypress.env.example.json` não são credenciais reais.

## Campos obrigatórios

| Chave | Uso | Pré-condição |
| --- | --- | --- |
| `email` / `password` | Login padrão (`cy.login()` sem argumento) — Login sucesso e Exames de Fase | Conta ativa com assinatura/acesso às certificações conforme o cenário |
| `alunoCompleto` | Exame Final: aluno com fases concluídas | 100% das fases aprovadas na certificação alvo |
| `alunoFasePendente` | Exame Final: bloqueio sem concluir todas as fases | Última fase ainda pendente |
| `alunoReprovado` | Exame Final: bloqueio sem aprovação em todas as fases | Reprovação residual na última fase |
| `emailJaCadastrado` | Cadastro: e-mail já utilizado | Conta existente; senha só necessária se o step a reutilizar |

## Formato

Objetos de perfil devem ser:

```json
{
  "email": "conta@dominio-autorizado",
  "password": "senha-local-nao-commitada"
}
```

Validação rápida:

```powershell
npm run check:env
node scripts/check-env.mjs --require-auth
node scripts/check-env.mjs --require-profiles
```

## Domínio `@exemplo.test`

Os placeholders e os e-mails gerados pelo Cadastro (`certiqa.<timestamp>.<rand>@exemplo.test`) usam esse domínio fictício.

- Se o backend **aceitar**, mantenha.
- Se o backend **rejeitar**, o time deve combinar um domínio autorizado (ex.: e-mails reais de teste do ambiente Qazando) e atualizar apenas o `cypress.env.json` local / a geração em `cadastro.steps.js` **após autorização**, sem publicar credenciais.

## Colisões entre os cinco integrantes

Cadastros de sucesso já usam `Date.now()` + Faker → baixa colisão.

Para perfis compartilhados (`alunoCompleto`, etc.):

1. Combinar no chat **quem** usa cada conta em cada janela de execução.
2. Ou provisionar um conjunto por integrante (`alunoCompleto.marcos@...`, etc.) mantendo o mesmo formato de chaves no `cypress.env.json` local de cada um.
3. Não rodar `test:fases` / `test:final` em paralelo sobre a **mesma** conta.

## Classificação de risco dos testes

| Classe | Comandos | Altera dados? |
| --- | --- | --- |
| READ_ONLY | `npm run test:smoke` | Não |
| AUTH | `npm run test:login` | Não (somente autentica) |
| MUTATING | `npm run test:cadastro` | Sim (cria usuários) |
| AUTH+MUTATING | `npm run test:fases`, `npm run test:final` | Sim (progresso/exames) |

A suíte `npm run test:all` só executa AUTH/MUTATING se:

```powershell
$env:CERTIQA_ALLOW_AUTH = "1"
$env:CERTIQA_ALLOW_MUTATING = "1"
```
