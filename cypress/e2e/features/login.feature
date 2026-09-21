# language: pt
Funcionalidade: Login
  Como um usuário do CertiQA
  Quero acessar a página de login
  Para autenticar na plataforma

  Cenário: Acessar a página de login
    Dado que estou na página inicial
    Quando acesso a página de login
    Então o formulário de login deve ser exibido
