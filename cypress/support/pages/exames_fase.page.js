/// <reference types="cypress" />
import certificacoes from "../../fixtures/certificacoes.json";
import questoesCtfl from "../../fixtures/questoes_ctfl.json";

const porcAprovacao = 0.6;
let totalNumQuestoes;

class ExamesFasePage {
    certificacaoAtual = "";
    faseAtual = "";

    botaoAzul() {
        return cy.get("button.bg-primary");
    }

    botaoAcessarFase(fase) {
        return cy.contains("div.grid div.rounded-lg > div > div span.text-sm", fase)
            .parent("div")
            .parent("div")
            .parent("div")
            .find("div a");
    }

    botaoVoltarPara() {
        return cy.get("svg.lucide-arrow-left").parent("button")
    }

    alternativasQuestoes() {
        return cy.get("div.space-y-2 label.border-gray-200");
    }

    iconeFaseConcluida() {
        return cy.get("div.grid div.rounded-lg > div > div svg.lucide-circle-check-big")
    }

    iconeFaseEspecificaConcluida(fase) {
        return cy.contains("div.grid div.rounded-lg > div > div span.text-sm", fase)
            .parent("div")
            .find("svg.lucide-circle-check-big")
    }

    iconeFaseLiberada() {
        return cy.get("div.grid div.rounded-lg > div > div svg.lucide-book-open")
    }

    iconeFaseBloqueada() {
        return cy.get("div.grid div.rounded-lg > div > div svg.lucide-lock")
    }

    botaoFaseBloqueada() {
        return cy.contains("div.rounded-lg button", "Fase bloqueada")
    }

    barraProgressoFase() {
        return cy.get("div.grid div.rounded-lg div[role='progressbar']")
    }

    mensagemResultadoQuiz() {
        return cy.get("div.text-center :nth-child(3)")
    }

    labelFaseConcluida() {
        return cy.get("div span.bg-green-100")
    }

    porcentagemProgessoGeral() {
        return cy.get("[role='progressbar'] + span")
    }

    fasesConcluidas() {
        return cy.get(".items-center svg + span")
    }

    statusCertificacao() {
        return cy.get("div p + div.rounded-full")
    }

    parabensFasesConcluidas() {
        return cy.get("div p + div.rounded-full")
    }

    botaoIniciarSimuladoFinal() {
        return cy.get("a.bg-green-600")
    }

    totalquestoequiz() {
        return cy.get("div.space-y-2 div.text-sm span:nth-child(1)")
            .invoke("text")
            .then((texto) => {
                totalNumQuestoes = parseInt(texto.split("de ")[1].trim(), 10);
                return totalNumQuestoes;
            });
    }

    resultadoQuestoesAcertadas() {
        return cy.get(".text-center .text-3xl")
            .invoke("text")
            .then((texto) => {
                const questesAcertadas = parseInt(texto.split("/")[0].trim())
                return questesAcertadas
            })
    }

    totalFases() {
        return this.fasesConcluidas()
            .invoke("text")
            .then((texto) => {
                const totalFases = parseInt(texto.split("de ")[1].trim());
                return totalFases;
            });
    }

    numFasesConculidas() {
        return this.fasesConcluidas()
            .invoke("text")
            .then((texto) => {
                const totalFasesConcluídas = parseInt(texto.split(" de")[1].trim());
                return totalFasesConcluídas;
            });
    }

    verificarFasesDisponiveis() {
        cy.get("div.mb-8 > div.grid > div").its("length").should("be.greaterThan", 0);
    }

    clicarIniciarQuiz() {
        this.botaoAzul().click();
    }

    clicarBotaoProximo() {
        return this.botaoAzul().click();
    }

    login() {
        cy.visit("/");
        cy.contains("button", "Login").click();
        cy.get("#email").type("tisita1276@caps7.com");
        cy.get("#password").type("123456");
        cy.contains("button", "Entrar").click();
        cy.url().should("eq", `${Cypress.config("baseUrl")}painel`);
        cy.contains("div", "Login bem-sucedido").should("be.visible");
        cy.contains("div", "Bem-vindo, Usuario Teste!").should("be.visible");
    }

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
        cy.url().should("include", url);
    }

    paginaCertificacao() {
        cy.get('a[href="/certificacoes"]').first().click();
    }

    validarMensagem(mensagem) {
        cy.contains(mensagem).should("be.visible");
    }

    selecionarCTFL() {
        cy.get('a[href="/certificacoes/ctfl"]').should("exist").click({ force: true });
    }

    validarCTFL() {
        cy.contains("ISTQB Certified Tester Foundation Level (CTFL)").should("be.visible");
    }

    selecionarAgile() {
        cy.get('a[href="/certificacoes/ctfl-at"]').should("exist").click({ force: true });
    }

    validarAgile() {
        cy.contains("ISTQB Certified Tester Foundation Level - Agile Tester (CTFL-AT)")
            .should("be.visible");
    }

    selecionarCertificacao(certificacao) {
        this.certificacaoAtual = certificacao;
        if (certificacao === "CTFL") {
            this.selecionarCTFL();
            this.validarCTFL();
        } else if (certificacao === "Agile Tester") {
            this.selecionarAgile();
            this.validarAgile();
        }
    }

    apresentaFases() {
        cy.contains("h2", "Fases de Estudo")
            .should("be.visible")
            .parent()
            .find("h3")
            .should("have.length.at.least", 1);
    }

    validarFases() {
        cy.contains("Fases de Estudo").should("be.visible");
    }

    selecionarFase(fase) {
        this.faseAtual = fase;
        const dadosFase = certificacoes[this.certificacaoAtual][fase];

        cy.contains(dadosFase.titulo)
            .parent()
            .parent()
            .contains(/Iniciar estudo|Revisar fase|Continuar estudo/i)
            .click({ force: true });

        this.abrirQuiz();
    }

    abrirQuiz() {
        cy.contains(/Iniciar Quiz|Refazer quiz/i).should("be.visible").click({ force: true });
    }

    responderQuestoes() {
        const gabarito = certificacoes[this.certificacaoAtual][this.faseAtual].gabarito;

        gabarito.forEach((resposta, index) => {
            cy.contains(resposta, { timeout: 10000 })
                .scrollIntoView()
                .should("be.visible");
            cy.contains(resposta).click();

            if (index < gabarito.length - 1) {
                cy.contains("button", "Próxima")
                    .scrollIntoView()
                    .should("be.visible")
                    .click();
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
            cy.contains(`Questão ${i}`).scrollIntoView().should("be.visible");
            cy.contains(`Questão ${i}`)
                .closest(".border")
                .contains(/Ver detalhes/i, { timeout: 10000 })
                .should("be.visible")
                .click({ force: true });

            cy.get("body").then(($body) => {
                const textoDoCard = $body.find(`.border:contains("Questão ${i}")`).text();
                if (!textoDoCard.includes("Explicação")) {
                    cy.contains(`Questão ${i}`)
                        .closest(".border")
                        .contains(/Ver detalhes/i)
                        .click({ force: true });
                }
            });

            cy.contains(`Questão ${i}`)
                .closest(".border")
                .contains(/Explicação/i, { timeout: 10000 })
                .should("be.visible");
        }
    }

    responderQuestoesPercentual(percentual) {
        const gabarito = certificacoes[this.certificacaoAtual][this.faseAtual].gabarito;
        const quantidadeCerta = Math.ceil(gabarito.length * percentual);

        gabarito.forEach((respostaCorreta, index) => {
            if (index < quantidadeCerta) {
                cy.contains(respostaCorreta).should("be.visible").click({ force: true });
            } else {
                cy.get("label")
                    .not(`:contains("${respostaCorreta}")`)
                    .first()
                    .click({ force: true });
            }

            if (index < gabarito.length - 1) {
                cy.contains("button", "Próxima").should("be.visible").click({ force: true });
            }
        });
    }

    finalizarExamePercentual(percentual) {
        const totalQuestoes = certificacoes[this.certificacaoAtual][this.faseAtual].gabarito.length;
        const acertos = Math.ceil(totalQuestoes * percentual);
        cy.contains(`${acertos}/${totalQuestoes}`).should("be.visible");
    }

    aprovarCom70() {
        cy.contains("Parabéns! Você passou!").should("be.visible");
    }

    acessarCertificacao(opcaoMenu, certificacao) {
        cy.contains("nav a", opcaoMenu).click();
        cy.contains("div.rounded-lg div h3", certificacao)
            .parent("div")
            .parent("div")
            .find("div a")
            .click();
    }

    responderAteResultado(fase, quantidadeErradas, erradasRespondidas = 0) {
        return cy
            .get("div.flex-col.p-6 h3")
            .should("be.visible")
            .invoke("text")
            .then((titulo) => {
                if (titulo.includes("Resultado")) {
                    return;
                }

                const respondeuErrado = erradasRespondidas < quantidadeErradas;
                const responder = respondeuErrado
                    ? this.responderQuestaoIncorretamente(fase)
                    : this.responderQuestaoCorretamente(fase);

                return responder
                    .then(() => this.clicarBotaoProximo())
                    .then(() =>
                        this.responderAteResultado(
                            fase,
                            quantidadeErradas,
                            erradasRespondidas + (respondeuErrado ? 1 : 0)
                        )
                    );
            });
    }

    validarNumQuestoesAcertadas(nomeCenario) {
        return this
            .resultadoQuestoesAcertadas()
            .should("equal", this.numQuestoesAcertadas(nomeCenario));
    }

    selecionarAlternativaQuestao(indice) {
        cy.get(`div.space-y-2 label.border-gray-200:nth-child(${indice})`).click();
        this.alternativasQuestoes().its("length").should("equal", 3);
        cy.get("div.space-y-2 label.border-primary").its("length").should("equal", 1);
    }

    buscarQuestaoAtual(fase) {
        return cy.get("div.p-6 > div > div h3")
            .should("be.visible")
            .invoke("text")
            .then((texto) => {
                const perguntaAtual = texto.trim();
                const chaveFase = fase.toLowerCase().replace(/\s+/g, "");
                const questoesDaFase = questoesCtfl[chaveFase];
                expect(questoesDaFase, `Fase "${fase}" encontrada no fixture`).to.exist;
                const normalizarPergunta = (pergunta) =>
                    pergunta.replace(/['"“”‘’]/g, "").trim();
                const questao = Object.values(questoesDaFase).find(
                    ({ pergunta }) => normalizarPergunta(pergunta) === normalizarPergunta(perguntaAtual)
                );
                expect(questao, `Pergunta encontrada no fixture: "${perguntaAtual}"`).to.exist;

                return questao;
            });
    }

    responderQuestaoCorretamente(fase) {
        return this.buscarQuestaoAtual(fase).then((questao) => {
            const respostaCorreta = questao["resposta-correta"];
            return cy.contains("div.space-y-2 label", respostaCorreta).click().then(() => {
                cy.log(`Resposta correta selecionada: ${respostaCorreta}`);
            });
        });
    }

    responderQuestaoIncorretamente(fase) {
        return this.buscarQuestaoAtual(fase).then((questao) => {
            const respostaCorreta = questao["resposta-correta"].trim();
            return cy
                .get("div.space-y-2 label")
                .filter((_, alternativa) => alternativa.innerText.trim() !== respostaCorreta)
                .first()
                .should("exist")
                .click()
                .then(() => {
                    cy.log("Resposta incorreta selecionada");
                });
        });
    }

    numRespostasErradas(totalQuestoes, nomeCenario) {
        if (nomeCenario.includes("inferior")) {
            return Math.floor(totalQuestoes * (1 - porcAprovacao)) + 1
        } else if (nomeCenario.includes("igual") || nomeCenario.includes("Concluir exame com sucesso")) {
            return Math.floor(totalQuestoes * (1 - porcAprovacao))
        } else if (nomeCenario.includes("superior") || nomeCenario.includes("Concluir fase com sucesso")) {
            return Math.floor(totalQuestoes * (1 - porcAprovacao)) - 1
        }
    }

    numQuestoesAcertadas(nomeCenario) {
        if (totalNumQuestoes === undefined) {
            throw new Error("O total de questões ainda não foi carregado.");
        }
        return totalNumQuestoes - this.numRespostasErradas(totalNumQuestoes, nomeCenario);
    }

}

export default new ExamesFasePage();