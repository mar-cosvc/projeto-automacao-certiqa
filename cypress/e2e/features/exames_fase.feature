      # language: pt

      Funcionalidade: Exames de Fase
      Como um usuário do CertiQA
      Quero acessar e realizar os exames de fase
      Para estudar para a certificação

      Contexto:
      Dado que o aluno está logado no sistema

      Esquema do Cenário: Acessar as fases após iniciar o estudo da Certificação
      Quando acessar o menu "Certificações" e seleciona certificação "<certificacao>"
      Então as fases da certificação devem estar disponíveis para acesso

      Exemplos:
      | certificacao |
      | CTFL         |
      | Agile Tester |

      Esquema do Cenário: Visualizar explicação das questões após finalizar o exame
      E que está na página da certificação "<certificacao>"
      E seleciona a fase "<fase>"
      Quando responde as questões
      E finaliza o exame
      Então cada questão deve apresentar uma explicação

      Exemplos:
      | certificacao | fase   |
      | CTFL         | fase 1 |
      | CTFL         | fase 2 |
      | CTFL         | fase 3 |
      | CTFL         | fase 4 |
      | CTFL         | fase 5 |
      | CTFL         | fase 6 |
      | Agile Tester | fase 1 |
      | Agile Tester | fase 2 |
      | Agile Tester | fase 3 |

      # @only
      # Cenário: Validar status das fases
      # Quando acessar o menu "Certificações" e seleciona certificação "(CTFL)"
      # Então as fases da certificação devem estar disponíveis para acesso
      # E validar fase concluída
      # E validar fase liberada
      # E validar fase bloqueada

      Cenário: Acessar questões de múltipla escolha
      Quando acessar o menu "Certificações" e seleciona certificação "(CTFL)"
      Quando selecionar "Fase 1" e clicar em Iniciar Quiz
      Então as questões devem ser apresentadas no formato de múltipla escolha permitindo selecionar apenas uma alternativa correta

      Esquema do Cenário: Ser aprovado com pontuação igual a setenta por cento
      E selecionou a fase "<fase>" da certificação "<certificacao>"
      Quando responde 70 por cento das questões corretamente
      E finaliza o exame com pontuação igual a 70 por cento
      Então o aluno deve ser aprovado na fase

      Exemplos:
      | certificacao | fase   |
      | CTFL         | fase 1 |
      | CTFL         | fase 2 |
      | CTFL         | fase 3 |
      | CTFL         | fase 4 |
      | CTFL         | fase 5 |
      | CTFL         | fase 6 |
      | Agile Tester | fase 1 |
      | Agile Tester | fase 2 |
      | Agile Tester | fase 3 |


Cenário: Reprovação com pontuação inferior a 70 por cento e refazer exame
Quando acessar o menu "Certificações" e seleciona certificação "(CTFL)"
Quando selecionar "Fase 2" e clicar em Iniciar Quiz
E finalizar o exame com pontuação inferior a 70 por cento
Então o aluno não deve ser aprovado na fase
Quando clicar em tentar novamente
Então validar que é apresentado a questão 1 do exame
E finalizar o exame com pontuação inferior a 70 por cento
Então o aluno não deve ser aprovado na fase

Cenário: Concluir fase com sucesso
Quando acessar o menu "Certificações" e seleciona certificação "(CTFL)"
Quando selecionar "Fase 1" e clicar em Iniciar Quiz
E finalizar o exame com pontuação para aprovaçao
Então validar fase aprovada

Cenário: Exame final liberado
Quando acessar o menu "Certificações" e seleciona certificação "(CTFL)"
Então validar Exame final disponibilizado para realização
      
      Esquema do Cenário: Aprovação com pontuação superior a 70 por cento
      E selecionou a fase "<fase>" da certificação "<certificacao>"
      Quando responde 80 por cento das questões corretamente
      E finaliza o exame com pontuação igual a 80 por cento
      Então o aluno deve ser aprovado na fase

      Exemplos:
      | certificacao | fase   |
      | CTFL         | fase 1 |
      | CTFL         | fase 2 |
      | CTFL         | fase 3 |
      | CTFL         | fase 4 |
      | CTFL         | fase 5 |
      | CTFL         | fase 6 |
      | Agile Tester | fase 1 |
      | Agile Tester | fase 2 |
      | Agile Tester | fase 3 |