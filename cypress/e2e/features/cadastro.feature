# language: pt
Funcionalidade: Cadastro de Usuário
  Como um visitante do site CertiQA
  Quero realizar o cadastro na plataforma
  Para poder acessar as funcionalidades exclusivas

  Contexto: Acessar a página de cadastro
    Dado que eu estou na página inicial do CertiQA
    Quando eu clico no botão ou link de cadastro

  Cenário: Cadastro realizado com sucesso
    E preencho o campo de nome com "Aluno QA"
    E preencho o campo de email com um email válido
    E preencho o campo de senha com "Senha@123"
    E clico no botão de finalizar cadastro
    Então devo ver uma mensagem de sucesso ou ser direcionado para o painel do usuário

  Cenário: Validar campo de email obrigatório
    E preencho o campo de nome com "Aluno QA"
    E deixo o campo de email em branco
    E preencho o campo de senha com "Senha@123"
    E clico no botão de finalizar cadastro
    Então o sistema deve exibir um alerta informando que o email é obrigatório
