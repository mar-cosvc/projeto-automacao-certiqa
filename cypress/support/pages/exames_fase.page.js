import certificacoes from '../../fixtures/certificacoes.json'

class ExamesFasePage {
    // variavel para guardar o estado atual das certificações:
    certificacaoAtual = "";
    faseAtual = "";

    informarEmail(email) {
        cy.get("#email").type(email);
    }

    informarSenha(password) {
        cy.get("#password").type(password);
    }

    clicarEntrar() {
        cy.contains("button", "Entrar").click();
    }

    validarUrl(url) {
        cy.url().should('include', url);
    }

    paginaCertificacao() {
        cy.get('a[href="/certificacoes"]').first().click();
    }

    validarMensagem(mensagem) {
        cy.contains(mensagem).should('be.visible');
    }

    selecionarCTFL() {
        cy.get('a[href="/certificacoes/ctfl"]').should('exist').click({ force: true });
    }

    validarCTFL() {
        cy.contains('ISTQB Certified Tester Foundation Level (CTFL)').should('be.visible');
    }

    selecionarAgile() {
        cy.get('a[href="/certificacoes/ctfl-at"]').should('exist').click({ force: true });
    }

    validarAgile() {
        cy.contains('ISTQB Certified Tester Foundation Level - Agile Tester (CTFL-AT)').should('be.visible');

    }

    selecionarCertificacao(certificacao) {
        this.certificacaoAtual = certificacao // CTFL ou Agile Tester
        if (certificacao === "CTFL") {
            this.selecionarCTFL();
            this.validarCTFL();
        } else if (certificacao === "Agile Tester") {
            this.selecionarAgile();
            this.validarAgile();
        }
    }

    apresentaFases() {
        cy.contains('h2', 'Fases de Estudo')
            .should('be.visible')
            .parent()
            .find('h3')
            .should('have.length.at.least', 1);
    }

    validarFases() {
        cy.contains('Fases de Estudo').should('be.visible');
    }

    selecionarFase(fase) {
        this.faseAtual = fase; // guarda a fase

        // pega os dados da certificação ativa e a fase atual
        const dadosFase = certificacoes[this.certificacaoAtual][fase];

        // verifica o título da fase e clica no botão de iniciar estudo, revisar fase ou continuar estudo
        cy.contains(dadosFase.titulo)
            .parent()
            .parent()
            .contains(/Iniciar estudo|Revisar fase|Continuar estudo/i)
            .click({ force: true });

        this.abrirQuiz();
    }

    abrirQuiz() {
        cy.contains(/Iniciar Quiz|Refazer quiz/i).should('be.visible').click({ force: true });
    }

    responderQuestoes() {
        // busca o gabarito dentro do json
        const gabarito = certificacoes[this.certificacaoAtual][this.faseAtual].gabarito;

        // passa por cada resposta clicando na alternativa
        gabarito.forEach((resposta, index) => {
            cy.contains(resposta, { timeout: 10000 })
                .scrollIntoView()
                .should('be.visible');
            cy.contains(resposta).click();

            if (index < gabarito.length - 1) {
                cy.contains("button", "Próxima")
                    .scrollIntoView()
                    .should('be.visible');
                cy.contains("button", "Próxima").click();
            }
        });
    }

    finalizarExame() {
        cy.contains("button", /Finalizar/i).click();
        cy.contains("Resultado do Quiz").should("be.visible");
    }

    validarExplicacao() {
        const totalQuestoes = certificacoes[this.certificacaoAtual][this.faseAtual].gabarito.length;

        for (let i = 1; i <= totalQuestoes; i++) {
            cy.contains(`Questão ${i}`)
                .scrollIntoView()
                .should("be.visible");

            // pega o card e procura o botão ver detalhes
            cy.contains(`Questão ${i}`)
                .closest('.border')
                .contains(/Ver detalhes/i, { timeout: 10000 })
                .should('be.visible')
                .click({ force: true });

            // verifica se o card contém a explicação, se não tiver, clica no botão ver detalhes
            cy.get('body').then(($body) => {
                const textoDoCard = $body.find(`.border:contains("Questão ${i}")`).text();
                if (!textoDoCard.includes('Explicação')) {
                    cy.contains(`Questão ${i}`)
                        .closest('.border')
                        .contains(/Ver detalhes/i)
                        .click({ force: true });
                }
            });

            cy.contains(`Questão ${i}`)
                .closest('.border')
                .contains(/Explicação/i, { timeout: 10000 })
                .should('be.visible');
        };
    }

    responderQuestoesSetentaPorCento() {
        const gabarito = certificacoes[this.certificacaoAtual][this.faseAtual].gabarito;
        const totalQuestoes = gabarito.length;

        // acertar apenas 70% das questões
        const quantidadeCerta = Math.round(totalQuestoes * 0.7);

        gabarito.forEach((respostaCorreta, index) => {
            if (index < quantidadeCerta) {
                cy.contains(respostaCorreta)
                    .should('be.visible')
                    .click({ force: true });
            } else {
                cy.get('label')
                    .not(`:contains("${respostaCorreta}")`)
                    .first()
                    .click({ force: true });
            }
            if (index < totalQuestoes - 1) {
                cy.contains("button", "Próxima").should('be.visible');
                cy.contains("button", "Próxima").click({ force: true });
            }
        });
    }
    
    finalizarExameCom70() {
        const totalQuestoes = certificacoes[this.certificacaoAtual][this.faseAtual].gabarito.length;
        const acertos = Math.round(totalQuestoes * 0.7);
        cy.contains(`${acertos}/${totalQuestoes}`).should("be.visible");
    }

    aprovarCom70() {
        cy.contains("Parabéns! Você passou!").should("be.visible");
    }
}

export default new ExamesFasePage();