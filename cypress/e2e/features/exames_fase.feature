# language: pt
Funcionalidade: Exames de Fase
Como um usuário do CertiQA
Quero acessar a página de certificações
Para iniciar e finalizar um exame de fase

Contexto: Acessar a página exame de fases
Dado que o aluno está logado no sistema
Quando acessar o menu "Certificações" e seleciona certificação "(CTFL)"

# Cenário: Acessar as fases após iniciar o estudo da Certificação
# Então as fases da certificação devem estar disponíveis para acesso

# ## Acessar com usuário que possua os 3 status de fase
# Cenário: Validar status das fase
# Então as fases da certificação devem estar disponíveis para acesso
# E validar fase concluída
# E validar fase liberada
# E validar fase bloqueada

# Cenário: Acessar questões de múltipla escolha
# Quando selecionar "Fase 1" e clicar em Iniciar Quiz
# Então as questões devem ser apresentadas no formato de múltipla escolha permitindo selecionar apenas uma alternativa correta

Cenário: Reprovação com pontuação inferior a 70 por cento e refazer exame
Quando selecionar "Fase 1" e clicar em Iniciar Quiz
E finalizar o exame com pontuação inferior a 70 por cento
Então o aluno não deve ser aprovado na fase
# Quando clicar em tentar novamente
# Então validar que é apresentado a questão 1 do exame
# E finalizar o exame com pontuação inferior a 70 por cento
# Então o aluno não deve ser aprovado na fase

# Cenário: Concluir fase com sucesso
# Quando selecionar "Fase 6" e clicar em Iniciar Quiz
# E finalizar o exame com pontuação para aprovaçao
# Então validar fase aprovada

# Cenário: Exame final liberado
# Então validar Exame final disponibilizado para realização