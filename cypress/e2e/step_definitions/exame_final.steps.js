/// <reference types="cypress" />
import { Before, Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import examesFasePage from "../page/exames_fase.page";
import exameFinalPage from "../page/exame_final.page";

let nomeCenario = "";

Before(({ pickle }) => {
  nomeCenario = pickle.name;
});

function responderAteResultado(fase, quantidadeErradas, erradasRespondidas = 0) {
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
        ? examesFasePage.responderQuestaoIncorretamente(fase)
        : examesFasePage.responderQuestaoCorretamente(fase);

      return responder
        .then(() => examesFasePage.clicarBotaoProximo())
        .then(() =>
          responderAteResultado(
            fase,
            quantidadeErradas,
            erradasRespondidas + (respondeuErrado ? 1 : 0)
          )
        );
    });
}

// funcao para validar 1 ponto por acerto, sem desconto por erro
function validarNumQuestoesAcertadas() {
  return examesFasePage.resultadoQuestoesAcertadas().should("equal", examesFasePage.numQuestoesAcertadas(nomeCenario));
}

When("iniciar simulado final", () => {
  examesFasePage.botaoIniciarSimuladoFinal().click()
  cy.get("h1.font-bold").should("have.text", "Simulado Final")
  examesFasePage.clicarIniciarQuiz()
})

Then("validar que a página do exame final foi aberta e possui 40 questões", () => {
  cy.get(".space-y-6").its("length").should("equal", 40)
  cy.get("[role='radiogroup'] div.p-4").its("length").should("equal", 40*4)
  exameFinalPage.exibirQuestaoCentroTela()
})