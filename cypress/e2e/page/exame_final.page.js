/// <reference types="cypress" />
import questoesCtfl from "../fixtures/questoes_ctfl.json";

const porcAprovacao = 0.6;
let totalNumQuestoes;

class ExamesFinalPage {

  questoesExameFinal() {
    return cy.get(".space-y-6")
  }

  exibirQuestaoCentroTela() {
    this.questoesExameFinal()
      .each(($el, index) => {
        const numeroIteracao = index + 1; // Transforma 0-based em 1-based para o nth-child
        cy.get(`.space-y-6:nth-child(${numeroIteracao}) p`).then((pergunta) => {
          
        })
          .scrollIntoView({ block: 'center' });
      });
  }

    responderQuestaoCorretamente(fase) {
    return this.exibirQuestaoCentroTela(fase).then((questao) => {
      const respostaCorreta = questao["resposta-correta"];
      return cy.contains("div.space-y-2 label", respostaCorreta).click().then(() => {
        cy.log(`Resposta correta selecionada: ${respostaCorreta}`);
      });
    });
  }

}

export default new ExamesFinalPage();