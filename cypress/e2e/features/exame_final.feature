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

            # Contexto: Acessar a página exame de fases

            Esquema do Cenário: Finalizar o Exame Final com pontuação "<classe_pontuacao>" a 80%
            Dado que o aluno está logado no sistema
            Quando acessar o menu "Certificações" e seleciona certificação "(CTFL)"
            E iniciar simulado final
            Então validar que a página do exame final foi aberta e possui 40 questões com tempo de 60 minutos para finalizar o exame
            Quando finalizar o exame
            Então o sistema deve apresentar o "<resultado>" imediatamente com a mensagem "<texto>"

            Exemplos:

            | classe_pontuacao | resultado        | texto             |
            | inferior         | Tente novamente! | tente novamente   |
            | igual            | Parabéns!        | Você foi aprovado |
            | superior         | Parabéns!        | Você foi aprovado |
