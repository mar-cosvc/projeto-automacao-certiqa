# CertiQA — Automação de Testes (Cypress + BDD)

Manual do time para QAs trabalharem em grupo no GitHub **sem gerar conflitos**.

---

## Sobre o projeto

Este repositório contém a automação de testes do site **CertiQA**, da Qazando.

| Item | Detalhe |
| --- | --- |
| Aplicação testada | [https://certiqa.qazando.com.br/](https://certiqa.qazando.com.br/) |
| Tipo de teste | End-to-end (E2E) |
| Ferramenta | Cypress |
| Linguagem | JavaScript |
| Estilo dos cenários | BDD com Gherkin (Cucumber) |
| Plugin BDD | `@badeball/cypress-cucumber-preprocessor` |
| Repositório | [https://github.com/mar-cosvc/projeto-automacao-certiqa](https://github.com/mar-cosvc/projeto-automacao-certiqa) |

A ideia do BDD é escrever o **comportamento esperado** em linguagem de negócio (arquivo `.feature`) e só depois mapear cada frase para código Cypress (arquivo de `step_definitions`).

### Estrutura das pastas

```text
projeto-automacao-certiqa/
├── cypress.config.js                  # Configuração do Cypress + Cucumber
├── package.json                       # Dependências e scripts npm
├── README.md                          # Este manual
├── cypress/
│   ├── support/
│   │   └── e2e.js                     # Arquivo de suporte (carregado antes dos testes)
│   └── e2e/
│       ├── features/                  # Cenários em Gherkin (.feature)
│       │   ├── login.feature
│       │   └── cadastro.feature
│       └── step_definitions/          # Código JavaScript que executa cada passo
│           ├── login.js
│           └── cadastro.steps.js
```

| Pasta / arquivo | Quem edita? | Para que serve? |
| --- | --- | --- |
| `cypress/e2e/features/login.feature` | QA responsável pelo Login | Texto Gherkin da tela de login |
| `cypress/e2e/step_definitions/login.js` | QA responsável pelo Login | Mapeamento Cypress dos passos de login |
| `cypress/e2e/features/cadastro.feature` | QA responsável pelo Cadastro | Texto Gherkin da tela de cadastro |
| `cypress/e2e/step_definitions/cadastro.steps.js` | QA responsável pelo Cadastro | Mapeamento Cypress dos passos de cadastro |
| `cypress.config.js` | Somente o líder, se necessário | Configuração global (não edite sem avisar) |

---

## Valores e regras do time (cultura prática)

Trabalhar em grupo no Git é simples quando todo mundo segue as mesmas regras.

### 1. Comunicação rápida

Avisar no **chat do grupo**:

1. **ANTES** de abrir um Pull Request (PR)
2. **LOGO APÓS** o PR ser aprovado e mergeado

Isso evita duas pessoas revisarem o mesmo PR, ou alguém começar uma tarefa em cima de código antigo.

### 2. Divisão de arquivos (regra de ouro contra conflito)

Cada QA fica responsável por **uma Feature / tela diferente**.

- Quem pega **Login** edita só `login.feature` e `login.js`
- Quem pega **Cadastro** edita só `cadastro.feature` e `cadastro.steps.js`
- **Nunca** editem o mesmo arquivo ao mesmo tempo

Conflito de merge (Merge Conflict) quase sempre acontece quando duas pessoas alteram as **mesmas linhas** do **mesmo arquivo**. Se cada pessoa tiver o seu arquivo, o Git consegue juntar o trabalho sozinho.

| Pode fazer | Evite |
| --- | --- |
| Criar uma branch só sua | Commitar direto na `main` |
| Editar os arquivos da sua feature | Editar o arquivo de outro QA |
| Abrir PR pequeno e objetivo | Juntar várias telas no mesmo PR |
| Avisar no chat antes do PR | Abrir PR em silêncio |

### 3. Mensagens de commit claras

Use um prefixo simples + uma frase curta em português:

| Prefixo | Quando usar | Exemplo |
| --- | --- | --- |
| `feat:` | Novo teste ou nova funcionalidade | `feat: adiciona teste de login` |
| `fix:` | Correção de um teste que quebrou | `fix: corrige seletor do botao entrar` |
| `docs:` | Documentação | `docs: atualiza documentacao` |
| `chore:` | Configuração, dependência, tarefa de manutenção | `chore: atualiza versao do cypress` |

Exemplos bons:

```bash
git commit -m "feat: adiciona teste de login"
git commit -m "feat: mapeia passos de cadastro"
git commit -m "docs: atualiza documentacao"
```

Exemplos ruins (evite):

```bash
git commit -m "ajuste"
git commit -m "teste"
git commit -m "asdasd"
```

---

## Primeiros passos (onboarding)

Siga esta ordem **do zero**, mesmo que seja o primeiro dia no time.

### Pré-requisitos

Antes de clonar, instale na sua máquina:

| Ferramenta | Para que serve | Como conferir |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) (LTS) | Roda o npm e o Cypress | `node -v` |
| npm (vem com o Node.js) | Instala as dependências | `npm -v` |
| [Git](https://git-scm.com/) | Versionamento | `git -v` |
| Conta no GitHub | Acessar o repositório | Peça ao líder para te adicionar como colaborador |

Se o líder ainda não te adicionou como colaborador, você consegue **clonar** (o repositório é público), mas pode não conseguir **enviar** (`git push`) a sua branch.

### 1. Clonar o repositório

Abra o terminal (PowerShell no Windows, ou Git Bash) e rode:

```bash
# 1. Clonar o repositório
git clone https://github.com/mar-cosvc/projeto-automacao-certiqa.git

# 2. Entrar na pasta do projeto
cd projeto-automacao-certiqa

# 3. Instalar todas as dependências do Cypress e plugins
npm install

# 4. Abrir a interface visual do Cypress para rodar os testes
npx cypress open
```

O que cada comando faz:

| Comando | O que acontece |
| --- | --- |
| `git clone ...` | Baixa o projeto do GitHub para o seu computador |
| `cd projeto-automacao-certiqa` | Entra na pasta do projeto |
| `npm install` | Lê o `package.json` e baixa Cypress, Cucumber e o bundler |
| `npx cypress open` | Abre a tela do Cypress para você escolher e rodar os testes |

### 2. Rodar o primeiro teste no Cypress

1. No Cypress, escolha **E2E Testing**
2. Escolha um navegador (Chrome, por exemplo) e clique em **Start E2E Testing in Chrome**
3. Você verá os arquivos `.feature` (Login e Cadastro)
4. Clique em `login.feature` para ver um cenário já mapeado
5. Clique em `cadastro.feature` para ver os cenários de cadastro (os passos ainda estão como esqueleto didático)

Para rodar **sem abrir a interface** (modo terminal):

```bash
npx cypress run
```

Ou, pelos scripts do `package.json`:

```bash
npm run cy:open
npm run cy:run
```

### 3. Como um cenário BDD vira teste

```text
cadastro.feature          →  o QUE testar (linguagem de negócio)
cadastro.steps.js         →  o COMO testar (comandos Cypress)
```

Exemplo:

| Frase no `.feature` | Função no `.js` |
| --- | --- |
| `Dado que eu estou na página inicial do CertiQA` | `Given("que eu estou na página inicial do CertiQA", ...)` |
| `Quando eu clico no botão ou link de cadastro` | `When("eu clico no botão ou link de cadastro", ...)` |
| `E preencho o campo de nome com "Aluno QA"` | `And("preencho o campo de nome com {string}", ...)` |
| `Então o sistema deve exibir um alerta...` | `Then("o sistema deve exibir um alerta...", ...)` |

O texto precisa ser **igual** (ou seguir o padrão `{string}` para valores entre aspas). Se a frase do `.feature` não existir no `.js`, o Cypress avisa: *Step implementation missing*.

No arquivo `cadastro.steps.js`, os comandos `cy.visit`, `cy.get` e `cy.type` estão **comentados de propósito**. O QA responsável pelo Cadastro deve:

1. Abrir [https://certiqa.qazando.com.br/](https://certiqa.qazando.com.br/)
2. Inspecionar os campos reais (nome, e-mail, senha, botões)
3. Descomentar e ajustar os seletores
4. Rodar o cenário até ele ficar verde

---

## Fluxo diário do Git (para evitar conflitos de código)

Siga este roteiro **toda vez** que for começar uma nova tarefa. Não pule o passo 1.

### Visão geral

```text
main (oficial, protegida pelo líder)
  └── feature/nome-da-sua-tarefa  ← você trabalha AQUI
         └── Pull Request para a main
```

### 1. Sempre atualizar a `main` local antes de tudo

Você precisa do código mais recente do time, senão sua branch nasce atrasada e o PR pode dar conflito.

```bash
git checkout main
git pull origin main
```

| Comando | Significado |
| --- | --- |
| `git checkout main` | Volta para a branch principal |
| `git pull origin main` | Baixa e aplica o que já está no GitHub |

### 2. Criar uma ramificação única (branch) para a sua tarefa

O nome da branch deve ser curto, em minúsculas e com hífen.

```bash
git checkout -b feature/nome-da-sua-tarefa
```

Exemplos:

```bash
git checkout -b feature/cadastro-sucesso
git checkout -b feature/login-campos-obrigatorios
git checkout -b docs/atualiza-readme
```

**Uma tarefa = uma branch.** Não misture login e cadastro na mesma branch.

### 3. Desenvolver o código localmente e salvar

- Edite **somente** os arquivos da sua feature
- Salve no editor
- Rode o Cypress e confira se o cenário passou (ou se o esqueleto está correto)

### 4. Adicionar as alterações e commitar

```bash
git add .
git commit -m "feat: descricao curta"
```

Exemplos reais para este projeto:

```bash
git add .
git commit -m "feat: adiciona teste de cadastro com sucesso"

git add .
git commit -m "feat: valida email obrigatorio no cadastro"
```

Antes de commitar, você pode conferir o que mudou:

```bash
git status
git diff
```

### 5. Enviar a branch para o GitHub

```bash
git push origin feature/nome-da-sua-tarefa
```

Substitua `feature/nome-da-sua-tarefa` pelo nome **exato** da branch que você criou.

Se for o **primeiro** push dessa branch, o Git pode sugerir:

```bash
git push -u origin feature/nome-da-sua-tarefa
```

Os dois funcionam. O `-u` só “lembra” o rastreamento da branch remota.

### 6. Abrir um Pull Request para a `main`

1. Acesse [https://github.com/mar-cosvc/projeto-automacao-certiqa](https://github.com/mar-cosvc/projeto-automacao-certiqa)
2. O GitHub costuma mostrar o botão **Compare & pull request** depois do `push`
3. **Base** (destino): `main`
4. **Compare** (origem): a sua branch `feature/...`
5. Título claro, no mesmo padrão do commit. Ex.: `feat: adiciona teste de cadastro`
6. Na descrição, diga:
   - qual tela/feature você automatizou
   - como o líder pode validar (ex.: abrir o Cypress e rodar `cadastro.feature`)
7. Avise no **chat do grupo ANTES** de abrir o PR
8. Peça revisão ao líder do Git
9. Quando o PR for aprovado e mergeado, avise **LOGO APÓS** no chat

Depois do merge, atualize sua máquina de novo:

```bash
git checkout main
git pull origin main
```

Aí você está pronto para a **próxima** tarefa, repetindo o fluxo desde o passo 1.

---

## Checklist rápido (cole no chat se quiser)

Use esta lista antes de pedir revisão:

- [ ] Eu atualizei a `main` com `git pull` antes de criar a branch
- [ ] Minha branch tem um nome único (`feature/minha-tarefa`)
- [ ] Eu editei só os arquivos da **minha** feature
- [ ] A mensagem de commit está no padrão (`feat:`, `fix:` ou `docs:`)
- [ ] Eu enviei a branch com `git push`
- [ ] Eu avisei no chat **antes** de abrir o Pull Request
- [ ] O PR aponta para a `main`

---

## Comandos úteis (cola do dia a dia)

```bash
git status                          # o que mudou na sua máquina
git branch                          # em qual branch você está
git checkout main                   # voltar para a main
git pull origin main                # atualizar a main
git checkout -b feature/minha-tarefa
git add .
git commit -m "feat: descricao curta"
git push origin feature/minha-tarefa
```

Se você criou arquivos na branch errada, **pare e avise no chat**. Não tente “forçar” a `main`. O líder ajuda a corrigir.

---

## Dúvidas frequentes

**Posso commitar direto na `main`?**  
Não. A `main` é a versão oficial do time. Tudo entra por Pull Request.

**O Cypress abriu, mas o cenário de cadastro não faz nada.**  
Isso é esperado no início: os comandos em `cadastro.steps.js` estão comentados para o grupo aprender a mapear os seletores.

**Deu erro de *Step implementation missing*.**  
A frase do `.feature` não está igual à do `.js`. Compare os dois arquivos letra por letra.

**Deu conflito no GitHub.**  
Provavelmente duas pessoas editaram o mesmo arquivo. Avise o líder, não tente resolver sozinho se não tiver segurança. Na próxima tarefa, volte à regra: **um QA, uma feature, um conjunto de arquivos**.
