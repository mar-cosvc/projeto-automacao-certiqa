/// <reference types="cypress" />
import questoesCtfl from "../fixtures/questoes_ctfl.json";

const porcAprovacao = 0.6;
let totalNumQuestoes;

class ExamesFasePage {

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

  acessarCertificacao(opcaoMenu, certificacao) {
    cy.contains("nav a", opcaoMenu).click();
    cy.contains("div.rounded-lg div h3", certificacao)
      .parent("div")
      .parent("div")
      .find("div a")
      .click();
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