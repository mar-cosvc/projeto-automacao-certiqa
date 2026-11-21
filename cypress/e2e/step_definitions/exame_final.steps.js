/// <reference types="cypress" />
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import exameFinalPage from "../../support/pages/exame_final.page";
import examesFasePage from "../../support/pages/exames_fase.page";

Given("que o aluno {string} está logado no sistema", (tipoUsuario) => {
  cy.login(tipoUsuario);
});

Given("está na página da certificação {string}", (certificacao) => {
  examesFasePage.paginaCertificacao();
  examesFasePage.selecionarCertificacao(certificacao);
});

When("tentar acessar o Exame Final", () => {
  exameFinalPage.tentarAcessarSimulado();
});

Then("o sistema não deve permitir o acesso ao Exame Final", () => {
  exameFinalPage.semAcessoSimuladoFinal();
});

Given("conclui todas as fases anteriores à última", () => {
  exameFinalPage.completarFasesAprovandoExcetoUltima(examesFasePage.certificacaoAtual);
});

When("conclui as fases anteriores e reprova na última", () => {
  exameFinalPage.reprovarUltimaFase(examesFasePage.certificacaoAtual);
});


When("deixa um ou mais exames sem concluir", () => {
  exameFinalPage.validaFaseNaoConcluida();
});

Given("concluiu 100% das fases da certificação", () => {
  exameFinalPage.validarFasesConcluidas();
});

Given("foi aprovado em todos os exames de fase", () => {
  exameFinalPage.validarAprovado();
});

When("iniciar o Exame Final", () => {
  exameFinalPage.clicarIniciarExameFinal();
  exameFinalPage.iniciarSimulado();
});

Then("as questões devem ser selecionadas a partir dos conteúdos de todas as fases da certificação", () => {
  exameFinalPage.validarQuestoesContempladas(examesFasePage.certificacaoAtual);
});

Then("o sistema deve disponibilizar o tempo limite definido para a certificação selecionada", () => {
  exameFinalPage.validaElementoCronometro();
  exameFinalPage.validaTempo()
});

Given("iniciou o Exame Final", () => {
  exameFinalPage.clicarIniciarExameFinal();
  exameFinalPage.iniciarSimulado();
});

When("finalizar o exame com pontuação igual a 80%", () => {
  exameFinalPage.responderSimuladoFinalPorPorcentagem(0.8);
});

Then("o sistema deve apresentar o resultado imediatamente", () => {
  exameFinalPage.validarResultadoFinal();
});

Then("deve registrar a aprovação do aluno", () => {
  exameFinalPage.validarAprovacaoFinal();
});
