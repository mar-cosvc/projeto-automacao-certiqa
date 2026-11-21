# language: pt
Funcionalidade: Exame Final
Como um usuário do CertiQA que concluiu todos os exames de fase de uma certificação
Quero acessar a página de certificações
Para iniciar e finalizar um exame de fase

Esquema do Cenário: Impedir o acesso ao Exame Final sem concluir todas as fases
Dado que o aluno "alunoFasePendente" está logado no sistema
E está na página da certificação "<certificacao>"
E conclui todas as fases anteriores à última
Quando tentar acessar o Exame Final
Então o sistema não deve permitir o acesso ao Exame Final

Exemplos:
| certificacao |
| CTFL         |
| Agile Tester |

Esquema do Cenário: Impedir o acesso ao Exame Final sem aprovação em todos os exames de fase
Dado que o aluno "alunoReprovado" está logado no sistema
E está na página da certificação "<certificacao>"
Quando conclui as fases anteriores e reprova na última
Então o sistema não deve permitir o acesso ao Exame Final

Exemplos:
| certificacao |
| CTFL         |
| Agile Tester |

Esquema do Cenário: Verificar se as questões contemplam todas as fases da certificação
Dado que o aluno está logado no sistema
E está na página da certificação "<certificacao>"
E concluiu 100% das fases da certificação
E foi aprovado em todos os exames de fase
Quando iniciar o Exame Final
Então as questões devem ser selecionadas a partir dos conteúdos de todas as fases da certificação

Exemplos:
| certificacao |
| CTFL         |
| Agile Tester |

Esquema do Cenário: Aplicar o tempo limite específico de cada certificação
Dado que o aluno está logado no sistema
E está na página da certificação "<certificacao>"
E concluiu 100% das fases da certificação
E foi aprovado em todos os exames de fase
Quando iniciar o Exame Final
Então o sistema deve disponibilizar o tempo limite definido para a certificação selecionada

Exemplos:
| certificacao |
| CTFL         |
| Agile Tester |

Esquema do Cenário: Aprovar no Exame Final com pontuação exatamente igual a 80%
Dado que o aluno está logado no sistema
E está na página da certificação "<certificacao>"
E concluiu 100% das fases da certificação
E foi aprovado em todos os exames de fase
E iniciou o Exame Final
Quando finalizar o exame com pontuação igual a 80%
Então o sistema deve apresentar o resultado imediatamente
E deve registrar a aprovação do aluno

Exemplos:
| certificacao |
| CTFL         |
| Agile Tester |

