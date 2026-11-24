/// <reference types="cypress" />
import { Before, Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import exameFinalPage from "../../support/pages/exame_final.page";
import examesFasePage from "../../support/pages/exames_fase.page";

let nomeCenario = "";

Before(({ pickle }) => {
  nomeCenario = pickle.name;
  exameFinalPage.reiniciarEstadoCenario();
});

Given("que o aluno {string} está logado no sistema", (tipoUsuario) => {
  // Mass Factory: perfis alunoCompleto | alunoFasePendente | alunoReprovado
  cy.login(tipoUsuario);
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
  const certificacao = examesFasePage.certificacaoAtual;
  exameFinalPage.questoesExameFinal().each(($el, indice) =>
    exameFinalPage.finalizarExameFinal(indice, nomeCenario)
  );
  if (certificacao === "Agile Tester") {
    examesFasePage.botaoAzul()
      .should("not.contain.text", "(40/40)")
      .click();
  } else{
    examesFasePage.botaoAzul()
      .should("contain.text", "(40/40)")
      .click();
  }
})

Then("o sistema deve apresentar o {string} imediatamente com a mensagem {string}", (resultado, texto) => {
  exameFinalPage.mensagemResultadoExameFinal().should("have.text", resultado)
  exameFinalPage.textoResultadoExameFinal().should("contain.text", texto)
})

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
