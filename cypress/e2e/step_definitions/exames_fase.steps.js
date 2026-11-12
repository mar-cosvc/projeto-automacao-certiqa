/// <reference types="cypress" />
import { Before, Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import examesFasePage from "../../support/pages/exames_fase.page";

let faseSelecionada = "";
let nomeCenario = "";

Before(({ pickle }) => {
  nomeCenario = pickle.name;
});

Given("que o aluno está logado no sistema", () => {
  // examesFasePage.login();
  cy.login();
});

Given("está na página de certificações", () => {
  examesFasePage.paginaCertificacao();
  examesFasePage.validarMensagem("Certificações Disponíveis");
});

Given("que está na página da certificação {string}", (certificacao) => {
  examesFasePage.paginaCertificacao();
  examesFasePage.selecionarCertificacao(certificacao);
  examesFasePage.validarFases();
});

Given("seleciona a fase {string}", (fase) => {
  examesFasePage.selecionarFase(fase);
});

Given("selecionou a fase {string} da certificação {string}", (fase, certificacao) => {
  examesFasePage.paginaCertificacao();
  examesFasePage.selecionarCertificacao(certificacao);
  examesFasePage.selecionarFase(fase);
});

When("acessar o menu {string} e seleciona certificação {string}", (opcaoMenu, certificacao) => {
  examesFasePage.acessarCertificacao(opcaoMenu, certificacao);
});

When("seleciona a certificação {string}", (certificacao) => {
  examesFasePage.selecionarCertificacao(certificacao);
});

When("selecionar {string} e clicar em Iniciar Quiz", (fase) => {
  faseSelecionada = fase;
  examesFasePage.botaoAcessarFase(fase).click();
  cy.contains("h3", "Conteúdo da Fase").should("be.visible");
  examesFasePage.clicarIniciarQuiz();
});

When("responde as questões", () => {
  examesFasePage.responderQuestoes();
});

When("finaliza o exame", () => {
  examesFasePage.finalizarExame();
});

When("responde 70 por cento das questões corretamente", () => {
  examesFasePage.responderQuestoesPercentual(0.7);
});

When("finaliza o exame com pontuação igual a 70 por cento", () => {
  examesFasePage.finalizarExame();
  examesFasePage.finalizarExamePercentual(0.7);
});

When("finalizar o exame com pontuação inferior a 70 por cento", () => {
  return examesFasePage.totalquestoequiz().then((totalNumQuestoes) =>
    examesFasePage.responderAteResultado(
      faseSelecionada,
      examesFasePage.numRespostasErradas(totalNumQuestoes, nomeCenario)
    )
  );
});

When("clicar em tentar novamente", () => {
  examesFasePage.botaoAzul().click();
});

When("finalizar o exame com pontuação para aprovaçao", () => {
  return examesFasePage.totalquestoequiz().then((totalNumQuestoes) =>
    examesFasePage.responderAteResultado(
      faseSelecionada,
      examesFasePage.numRespostasErradas(totalNumQuestoes, nomeCenario)
    )
  );
});

Then("as fases da certificação devem estar disponíveis para acesso", () => {
  examesFasePage.verificarFasesDisponiveis();
  examesFasePage.apresentaFases();
});

Then("o sistema deve apresentar as fases", () => {
  examesFasePage.apresentaFases();
});

Then(
  "as questões devem ser apresentadas no formato de múltipla escolha permitindo selecionar apenas uma alternativa correta",
  () => {
    examesFasePage.alternativasQuestoes().its("length").should("be.greaterThan", 1);
    examesFasePage.selecionarAlternativaQuestao(1);
    examesFasePage.selecionarAlternativaQuestao(3);
    examesFasePage.selecionarAlternativaQuestao(4);
    examesFasePage.selecionarAlternativaQuestao(2);
    cy.log("==== Questão permite selecionar apenas uma alternativa - VALIDADO ====");
  }
);

Then("cada questão deve apresentar uma explicação", () => {
  examesFasePage.validarExplicacao();
});

Then("o aluno deve ser aprovado na fase", () => {
  examesFasePage.aprovarCom70();
});

Then("o aluno não deve ser aprovado na fase", () => {
  examesFasePage
    .mensagemResultadoQuiz()
    .should("contain", "Você precisa de pelo menos");
  examesFasePage.validarNumQuestoesAcertadas(nomeCenario);
  examesFasePage.botaoAzul().should("be.visible").and("have.text", "Tentar Novamente");
});

Then("validar que é apresentado a questão 1 do exame", () => {
  cy.contains("div.space-y-2 div.text-sm span:nth-child(1)", "Questão 1");
});

Then("validar fase concluída", () => {
  examesFasePage.iconeFaseConcluida().its("length").should("be.at.least", 1);
  cy.contains("div.grid div a", "Revisar fase").its("length").should("be.at.least", 1);
});

Then("validar fase liberada", () => {
  examesFasePage.iconeFaseLiberada().its("length").should("equal", 1);
  examesFasePage.iconeFaseLiberada().should("be.visible");
  examesFasePage.barraProgressoFase().should("be.visible");
  cy.contains("div.grid div a", "Continuar estudo").its("length").should("be.at.least", 1);
});

Then("validar fase bloqueada", () => {
  examesFasePage.iconeFaseBloqueada().its("length").should("be.at.least", 1);
  examesFasePage.botaoFaseBloqueada().its("length").should("be.at.least", 1);
  examesFasePage.botaoFaseBloqueada().should("be.disabled");
});

Then("validar fase aprovada", () => {
  examesFasePage.mensagemResultadoQuiz().should("contain", "Parabéns! Você passou!");
  examesFasePage.validarNumQuestoesAcertadas(nomeCenario);
  examesFasePage.botaoVoltarPara().click();
  examesFasePage.labelFaseConcluida().should("be.visible");
  examesFasePage.botaoVoltarPara().click();
  examesFasePage.iconeFaseEspecificaConcluida(faseSelecionada).should("be.visible");
  examesFasePage.botaoAcessarFase(faseSelecionada).should("have.text", "Revisar fase");
});

Then("validar Exame final disponibilizado para realização", () => {
  examesFasePage.porcentagemProgessoGeral().should("have.text", "100%");
  examesFasePage.numFasesConculidas().then((concluidas) => {
    examesFasePage.totalFases().should("equal", concluidas);
  });
  examesFasePage.statusCertificacao().should("have.text", "Pronto para Exame Final");
  examesFasePage.parabensFasesConcluidas().should("be.visible");
  examesFasePage.botaoIniciarSimuladoFinal().should("be.visible");
});

When("responde 80 por cento das questões corretamente", () => {
  examesFasePage.responderQuestoesPercentual(0.8);
});

When("finaliza o exame com pontuação igual a 80 por cento", () => {
  examesFasePage.finalizarExame();
  examesFasePage.finalizarExamePercentual(0.8);
});
