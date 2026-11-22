            # language: pt
            Funcionalidade: Exame Final
            Como um usuário do CertiQA que concluiu todos os exames de fase de uma certificação
            Quero acessar a página de certificações
            Para iniciar e finalizar um exame de fase

            Contexto: Acessar a página exame de fases
            Dado que o aluno está logado no sistema
            Quando acessar o menu "Certificações" e seleciona certificação "(CTFL)"
            E iniciar simulado final
            Então validar que a página do exame final foi aberta e possui 40 questões com tempo de 60 minutos para finalizar o exame


            Esquema do Cenário: Finalizar o Exame Final com pontuação "<classe_pontuacao>" a 80%
            Quando finalizar o exame
            Então o sistema deve apresentar o "<resultado>" imediatamente com o "<texto>"

            Exemplos:

            | classe_pontuacao | resultado        | texto             |
            | inferior         | Tente novamente! | tente novamente   |
            | igual            | Parabéns!        | Você foi aprovado |
            | superior         | Parabéns!        | Você foi aprovado |