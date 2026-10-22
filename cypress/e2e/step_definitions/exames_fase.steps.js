import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import exames_fasePage from "../../support/pages/exames_fase.page"; 

Given("que o aluno está logado no sistema", () => {
    cy.login();
});

// Cenário: Acessar as fases após iniciar o estudo
Given("está na página de certificações", () => {
    exames_fasePage.paginaCertificacao();
    exames_fasePage.validarMensagem('Certificações Disponíveis');
});
When("seleciona a certificação {string}", (certificacao) => {
    exames_fasePage.selecionarCertificacao(certificacao);
});
Then("o sistema deve apresentar as fases", () => {
    exames_fasePage.apresentaFases();
});

// Cenário: Visualizar explicação das questões após finalizar o exame
Given("que está na página da certificação {string}", (certificacao) => {
    exames_fasePage.paginaCertificacao();
    exames_fasePage.selecionarCertificacao(certificacao);
    exames_fasePage.validarFases();
});
Given("seleciona a fase {string}", (fase) => {
    exames_fasePage.selecionarFase(fase);
});
When("responde as questões", () => {
   exames_fasePage.responderQuestoes();
});
When("finaliza o exame", () => {
    exames_fasePage.finalizarExame();
});
Then("cada questão deve apresentar uma explicação", () => {
    exames_fasePage.validarExplicacao();
});

// Cenário: Ser aprovado com pontuação igual a 70 por cento
Given("selecionou a fase {string} da certificação {string}", (fase, certificacao) => {
    exames_fasePage.paginaCertificacao();
    exames_fasePage.selecionarCertificacao(certificacao);
    exames_fasePage.selecionarFase(fase);
});
When("responde 70 por cento das questões corretamente", () => {
    exames_fasePage.responderQuestoesSetentaPorCento();
});
When("finaliza o exame com pontuação igual a 70 por cento", () => {
    exames_fasePage.finalizarExame();
    exames_fasePage.finalizarExameCom70();
});
Then("o aluno deve ser aprovado na fase", () => {
    exames_fasePage.aprovarCom70();
});