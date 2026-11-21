/// <reference types="cypress" />
import { Before, Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import examesFasePage from "../../support/pages/exames_fase.page";
import exameFinalPage from "../../support/pages/exame_final.page";

let nomeCenario = "";

Before(({ pickle }) => {
  nomeCenario = pickle.name;
});

When("iniciar simulado final", () => {
  const certificacao = examesFasePage.certificacaoAtual;
  if (!certificacao) {
    throw new Error("Selecione uma certificação antes de iniciar o simulado final.");
  }
  examesFasePage.botaoIniciarSimuladoFinal().should("be.visible").click()
  const seletorTitulo = certificacao === "Agile Tester" ? "h2" : "h1";
  cy.contains(seletorTitulo, "Simulado Final", { timeout: 15000 }).should("be.visible")
  examesFasePage.clicarIniciarQuiz()
})

Then("validar que a página do exame final foi aberta e possui 40 questões com tempo de 60 minutos para finalizar o exame", () => {
  exameFinalPage.contadorTempoExameFinal().should("have.text", "60:00")
  exameFinalPage.totalQuestoesExameFinal().should("equal", 40)
  exameFinalPage.alternativasExameFinal().its("length").should("equal", 40 * 4)
})

When("finalizar o exame", () => {
  exameFinalPage.questoesExameFinal().each(($el, indice) =>
    exameFinalPage.finalizarExameFinal(indice, nomeCenario)
  );
  examesFasePage.botaoAzul()
    .should("contain.text", "(40/40)")
    .click();
})

Then ("o sistema deve apresentar o {string} imediatamente com o {string}", (resultado, texto) => {
  exameFinalPage.mensagemResultadoExameFinal().should("have.text", resultado)
  exameFinalPage.textoResultadoExameFinal().should("contain.text", texto)
})