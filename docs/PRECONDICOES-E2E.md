# Matriz de pré-condições E2E — CERTIQA G5

> Contas e senhas reais **não** entram neste documento.
> Configure apenas em `cypress.env.json` local (gitignored).

## Flags de execução

| Flag | Efeito |
| --- | --- |
| `CERTIQA_ALLOW_AUTH=1` | Libera Login autenticado |
| `CERTIQA_ALLOW_MUTATING=1` | Libera Cadastro / Fases / Final |
| `CERTIQA_MASS_CONFIRMED=1` | Confirmação humana de que os perfis estão no estado descrito abaixo |

Flags **não** substituem massa válida. Placeholders (`@exemplo.test`, senhas do example) são rejeitados com `--reject-placeholders`.

## Matriz por funcionalidade

| Área | Perfis | Estado inicial necessário | Certificação | Acesso | Risco de alteração | Resultado esperado | Reposição de massa |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Login (página) | — | N/A | — | Público | Nenhum | Formulario visível | Não |
| Login (sucesso) | `email`/`password` | Conta ativa com acesso ao painel | — | Autenticado | Baixo (sessão) | Redirect `/painel` | Não |
| Cadastro (validações) | — (Faker) | N/A | — | Público | Baixo | Mensagens de validação | Não |
| Cadastro (sucesso) | — (e-mail único) | N/A | — | Público | **Alto** (cria usuário) | Conta criada | Contas lixo no ambiente |
| Cadastro (e-mail já cadastrado) | `emailJaCadastrado` | Conta **já existente** | — | Público | Médio | Erro "e-mail já utilizado" | Manter conta fixa |
| Exames CTFL | `email`/`password` | Progresso conforme cenário (fase liberada / a concluir) | **CTFL** | Aluno com assinatura | **Alto** (altera fases) | 70% / explicações / status | Reset ou conta dedicada |
| Exames Agile | `email`/`password` | Idem | **Agile Tester** | Aluno com assinatura | **Alto** | Idem | Reset ou conta dedicada |
| Exame Final (bloqueios) | `alunoFasePendente`, `alunoReprovado` | Pendente na última / reprovado residual | CTFL e Agile | Autenticado | **Alto** | Acesso ao final negado | Recompor estados |
| Exame Final (fluxo 80%) | `alunoCompleto` (+ flat conforme steps) | 100% fases aprovadas | CTFL (e Agile nos esquemas) | Autenticado | **Alto** | Fronteiras 31/32/33 | Conta completa dedicada |

## Perfis — checklist operacional

| Perfil | Obrigatório para | Confirmar manualmente antes de `CERTIQA_MASS_CONFIRMED=1` |
| --- | --- | --- |
| `email` / `password` | Login, Fases | Login OK; acesso a Certificações CTFL/Agile |
| `emailJaCadastrado` | Cadastro (cenário duplicado) | E-mail já existe na plataforma |
| `alunoCompleto` | Exame Final (conteúdo/tempo/80%) | Todas as fases aprovadas; final liberado |
| `alunoFasePendente` | Bloqueio sem concluir fases | Última fase pendente |
| `alunoReprovado` | Bloqueio sem aprovação total | Reprovação residual na última fase |

## Ordem segura sugerida (após G5-R1)

1. `npm ci` com `NODE_OPTIONS=--use-system-ca` (Windows)
2. `npm run check:env` (+ `--reject-placeholders` quando for E2E real)
3. `npm run test:static` / `test:unit` / `test:smoke`
4. Somente com autorização do time:
   ```powershell
   $env:CERTIQA_ALLOW_AUTH = "1"
   # Login apenas:
   npm run test:login
   ```
5. Mutáveis somente após confirmação de massa:
   ```powershell
   $env:CERTIQA_ALLOW_MUTATING = "1"
   $env:CERTIQA_MASS_CONFIRMED = "1"
   npm run test:all
   ```

## Proibições G5-R1

- Não criar usuários automaticamente fora dos cenários autorizados.
- Não reutilizar credenciais históricas expostas.
- Não habilitar `CERTIQA_ALLOW_MUTATING` neste gate de preparação.
