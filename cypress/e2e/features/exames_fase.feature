# language: pt

Funcionalidade: Exames de Fase CTFL
  Como um usuário do CertiQA
  Quero acessar a página do exame de fases
  Para estudar para a certificação

Contexto: 
  Dado que o aluno está logado no sistema

Esquema do Cenário: Acessar as fases após iniciar o estudo
    E está na página de certificações
    Quando seleciona a certificação "<certificacao>"
    Então o sistema deve apresentar as fases
    
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
      | certificacao | fase  | 
      | CTFL         | fase 1|
      | CTFL         | fase 2|
      | CTFL         | fase 3|
      | CTFL         | fase 4|
      | CTFL         | fase 5|
      | CTFL         | fase 6|
      | Agile Tester | fase 1|
      | Agile Tester | fase 2|
      | Agile Tester | fase 3|

Esquema do Cenário: Ser aprovado com pontuação igual a setenta por cento
    E selecionou a fase "<fase>" da certificação "<certificacao>"
    Quando responde 70 por cento das questões corretamente
    E finaliza o exame com pontuação igual a 70 por cento
    Então o aluno deve ser aprovado na fase

    Exemplos:
      | certificacao | fase  | 
      | CTFL         | fase 1|
      | CTFL         | fase 2|
      | CTFL         | fase 3|
      | CTFL         | fase 4|
      | CTFL         | fase 5|
      | CTFL         | fase 6|
      | Agile Tester | fase 1|
      | Agile Tester | fase 2|
      | Agile Tester | fase 3|
