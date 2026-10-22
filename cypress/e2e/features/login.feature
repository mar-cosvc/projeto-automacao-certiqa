# language: pt
Funcionalidade: Login
  Como um usuário do CertiQA
  Quero acessar a página de login
  Para autenticar na plataforma

  Cenário: Acessar a página de login
    Dado que estou na página inicial do CertiQA
    Quando acesso a página de login
    Então o formulário de login deve ser exibido

  Cenário: Login com sucesso
    Dado que estou na página de login
    Quando preencho o campo E-mail com "tisita1276@caps7.com"
    E preencho o campo Senha com "123456"
    E clico no botão Entrar
    Então devo ser redirecionado para a página inicial do CertiQA
