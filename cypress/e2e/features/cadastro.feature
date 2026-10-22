# language: pt
Funcionalidade: Cadastro de Usuário
Como um visitante do site CertiQA
Quero realizar o cadastro na plataforma
Para poder acessar as funcionalidades exclusivas

Contexto: Acessar a página de cadastro
Dado que eu estou na página inicial do CertiQA
Quando eu clico no botão ou link de cadastro

Cenário: Cadastro com sucesso
E preencho o campo de nome com dados fictícios
E preencho os demais campos com dados fictícios
E clico no botão de finalizar cadastro
Então devo ver a mensagem "Cadastro realizado com sucesso!"
E devo ver a mensagem "Conta criada! Para acessar o conteúdo, finalize sua assinatura."


Cenário: Cadastro apenas com o primeiro nome
E preencho o campo de nome "Lilu"
E preencho os demais campos com dados fictícios
E clico no botão de finalizar cadastro


Cenário: Cadastro com números no campo de nome
E preencho o campo de nome "1234559"
E preencho os demais campos com dados fictícios
E clico no botão de finalizar cadastro


Cenário: Cadastro com nome em branco
E preencho o campo de nome " "
E preencho os demais campos com dados fictícios
E clico no botão de finalizar cadastro
Então devo ver a mensagem "Nome é obrigatório"


Cenário: Email vazio
E preencho o campo de nome com dados fictícios
E preencho os demais campos com dados fictícios
E preencho o campo de email " "
E clico no botão de finalizar cadastro
Então devo ver a mensagem "E-mail é obrigatório"

Cenário: Email inválido
E preencho o campo de nome com dados fictícios
E preencho os demais campos com dados fictícios
E preencho o campo de email "babi@hotmail"
E clico no botão de finalizar cadastro
Então devo ver a mensagem "E-mail inválido"


Cenário: Email sem o @
E preencho o campo de nome com dados fictícios
E preencho os demais campos com dados fictícios
E preencho o campo de email "lioutlook.com"
E clico no botão de finalizar cadastro
Então o campo de email deve indicar um formato inválido

Cenário: Email já cadastrado
E preencho o campo de nome "Bárbara Maria"
E preencho o campo de email "barbaraqaa@outlook.com" 
E preencho o campo de senha "Babi9890*"
E preencho o campo de confirmar senha "Babi9890*"
E clico no botão de finalizar cadastro
Então devo ver a mensagem "Erro no cadastro"
E devo ver a mensagem "Este e-mail já está sendo utilizado por outro usuário. Tente fazer login ou use outro e-mail."


Cenário: Senha com 1 caracter
E preencho o campo de nome com dados fictícios
E preencho o campo de email "joao@hotmail.com"
E preencho o campo de senha " "
E preencho o campo de confirmar senha " "
E clico no botão de finalizar cadastro
Então devo ver a mensagem "Senha deve ter pelo menos 6 caracteres"

Cenário: Com senhas vazias
E preencho o campo de nome com dados fictícios
E preencho o campo de email com dados fictícios
E clico no botão de finalizar cadastro
Então devo ver a mensagem "Senha é obrigatória"



Cenário: Confirmação de senha vazia
E preencho o campo de nome com dados fictícios
E preencho o campo de email com dados fictícios
E preencho o campo de senha com dados fictícios
E clico no botão de finalizar cadastro
Então devo ver a mensagem "As senhas não coincidem"


Cenário: Cadastro com campos vazios 
E clico no botão de finalizar cadastro
Então devo ver a mensagem "Nome é obrigatório"
E devo ver a mensagem "E-mail é obrigatório"
E devo ver a mensagem "Senha é obrigatória"
