/// <reference types="cypress" />
import questoesCtflExameFinal from "../../fixtures/questoes_ctfl_simulado_final.json";
import questoesCtflAtExameFinal from "../../fixtures/questoes_ctflAt_simulado_final.json";

const porcAprovacao = 0.65;
let totalNumQuestoes;
let numRespostasErradas;
let respostasErradasRealizadas = 0;
const opcaoResponder = ["acertar", "errar"];

function normalizarPergunta(pergunta) {
  return pergunta
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['"“”‘’]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function inteiroAleatorio(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function selecionarResposta(opcoes) {
  return opcoes[Math.floor(Math.random() * opcoes.length)];
}

const questoesExameFinalPorCertificacao = [
  ...Object.values(questoesCtflExameFinal),
  ...Object.values(questoesCtflAtExameFinal),
];

class ExamesFinalPage {

  questoesExameFinal() {
    return cy.get(".space-y-6")
  }

  contadorTempoExameFinal() {
    return cy.get("div > svg + span")
  }

  alternativasExameFinal() {
    return cy.get("[role='radiogroup'] div.p-4")
  }

  totalQuestoesExameFinal() {
    return this.questoesExameFinal().its("length")
  }

  mensagemResultadoExameFinal() {
    return cy.get(".text-4xl")
  }

  textoResultadoExameFinal() {
    return cy.get(".text-center .mt-2")
  }

  exibirQuestaoCentroTela(indice) {
    if (Number.isInteger(indice)) {
      return this.questoesExameFinal()
        .eq(indice)
        .scrollIntoView({ block: "center" });
    }

    return this.questoesExameFinal().each(($el) =>
      cy.wrap($el).scrollIntoView({ block: "center" })
    );
  }

  buscarQuestaoAtualExameFinal(indice) {
    return this.exibirQuestaoCentroTela(indice)
      .find("p")
      .invoke("text")
      .then((texto) => {
        const perguntaAtual = normalizarPergunta(texto);
        const questao = questoesExameFinalPorCertificacao.find(
          (item) =>
            typeof item.pergunta === "string" &&
            normalizarPergunta(item.pergunta) === perguntaAtual
        );

        expect(questao, `Pergunta encontrada no fixture: "${texto.trim()}"`).to.exist;
        return questao;
      });
  }

  responderQuestaoCorretamenteExameFinal(indice, questaoAtual) {
    const questaoEncontrada = questaoAtual
      ? cy.wrap(questaoAtual)
      : this.buscarQuestaoAtualExameFinal(indice);

    return questaoEncontrada.then((questao) => {
      const respostaCorreta = questao["resposta-correta"];
      expect(respostaCorreta, "Resposta correta encontrada no fixture")
        .to.be.a("string")
        .and.not.empty;

      return this.questoesExameFinal()
        .eq(indice)
        .contains("[role='radiogroup'] div.p-4", respostaCorreta)
        .click();
    });
  }

  responderQuestaoIncorretamenteExameFinal(indice, questaoAtual) {
    const questaoEncontrada = questaoAtual
      ? cy.wrap(questaoAtual)
      : this.buscarQuestaoAtualExameFinal(indice);

    return questaoEncontrada.then((questao) => {
      const respostaCorreta = questao["resposta-correta"];
      expect(respostaCorreta, "Resposta correta encontrada no fixture")
        .to.be.a("string")
        .and.not.empty;

      return this.questoesExameFinal()
        .eq(indice)
        .find("[role='radiogroup'] div.p-4")
        .should("have.length.at.least", 2)
        .filter(
          (_, alternativa) =>
            normalizarPergunta(alternativa.innerText) !== normalizarPergunta(respostaCorreta)
        )
        .first()
        .should("exist")
        .click();
    });
  }

  finalizarExameFinal(indice, nomeCenario) {
    if (indice === 0) {
      totalNumQuestoes = undefined;
      numRespostasErradas = undefined;
      respostasErradasRealizadas = 0;
    }

    const obterTotalQuestoes = totalNumQuestoes === undefined
      ? this.totalQuestoesExameFinal().then((totalQuestoes) => {
        totalNumQuestoes = totalQuestoes;
        return totalQuestoes;
      })
      : cy.wrap(totalNumQuestoes);

    return obterTotalQuestoes.then((totalQuestoes) => {
      if (numRespostasErradas === undefined) {
        const limiteDeErros = Math.floor(
          totalQuestoes - totalQuestoes * porcAprovacao
        );

        if (nomeCenario.includes("inferior")) {
          numRespostasErradas = inteiroAleatorio(limiteDeErros + 1, totalQuestoes);
        } else if (
          nomeCenario.includes("igual") ||
          nomeCenario.includes("Concluir exame com sucesso")
        ) {
          numRespostasErradas = limiteDeErros;
        } else if (
          nomeCenario.includes("superior") ||
          nomeCenario.includes("Concluir fase com sucesso")
        ) {
          numRespostasErradas = inteiroAleatorio(1, limiteDeErros - 1);
        } else if (
          nomeCenario.includes("100%")
        ) {
          numRespostasErradas = 0;
        } 
        else {
          throw new Error(`Cenário "${nomeCenario}" não define a pontuação do exame final.`);
        }
      }

      return this.buscarQuestaoAtualExameFinal(indice).then((questao) => {
        const respostaSelecionada = selecionarResposta(opcaoResponder);
        const respostaFinal =
          respostaSelecionada === "errar" &&
          respostasErradasRealizadas >= numRespostasErradas
            ? "acertar"
            : respostaSelecionada;

        const responder = respostaFinal === "errar"
          ? this.responderQuestaoIncorretamenteExameFinal(indice, questao)
          : this.responderQuestaoCorretamenteExameFinal(indice, questao);

        return responder.then(() => {
          if (respostaFinal === "errar") {
            respostasErradasRealizadas += 1;
          }
        });
      });
    });
  }
}



export default new ExamesFinalPage();