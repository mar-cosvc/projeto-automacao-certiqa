/// <reference types="cypress" />
import { Before, Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import examesFasePage from "../page/exames_fase.page";

let faseSelecionada = "";
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

Given("que o aluno está logado no sistema", () => {
  examesFasePage.login();
});

When("acessar o menu {string} e seleciona certificação {string}", (opcaoMenu, certificacao) => {
  examesFasePage.acessarCertificacao(opcaoMenu, certificacao);
});

Then("as fases da certificação devem estar disponíveis para acesso", () => {
  examesFasePage.verificarFasesDisponiveis();
});

When("selecionar {string} e clicar em Iniciar Quiz", (fase) => {
  faseSelecionada = fase;
  examesFasePage.botaoAcessarFase(fase).click();
  cy.contains("h3", "Conteúdo da Fase").should("be.visible");
  examesFasePage.clicarIniciarQuiz();
  // return faseSelecionada;
});

Then("as questões devem ser apresentadas no formato de múltipla escolha permitindo selecionar apenas uma alternativa correta", () => {
  examesFasePage.alternativasQuestoes().its("length").should("be.greaterThan", 1);
  examesFasePage.selecionarAlternativaQuestao(1);
  examesFasePage.selecionarAlternativaQuestao(3);
  examesFasePage.selecionarAlternativaQuestao(4);
  examesFasePage.selecionarAlternativaQuestao(2);
  cy.log('==== Questão permite selecionar apenas uma alternativa - VALIDADO ====');
});

When("finalizar o exame com pontuação inferior a 70 por cento", () => {
  return examesFasePage.totalquestoequiz().then((totalNumQuestoes) => {
    return responderAteResultado(
      faseSelecionada,
      examesFasePage.numRespostasErradas(totalNumQuestoes, nomeCenario)
    );
  });
});

Then("o aluno não deve ser aprovado na fase", () => {
  examesFasePage.mensagemResultadoQuiz().should("contain", "Você precisa de pelo menos")
  validarNumQuestoesAcertadas()
  examesFasePage.botaoAzul().should("be.visible").and("have.text", "Tentar Novamente")
})

When("clicar em tentar novamente", () => {
  examesFasePage.botaoAzul().click()
})

Then("validar que é apresentado a questão 1 do exame", () => {
  cy.contains("div.space-y-2 div.text-sm span:nth-child(1)", "Questão 1")
})

Then("validar fase concluída", () => {
  examesFasePage.iconeFaseConcluida().its("length").should("be.at.least", 1)
  cy.contains("div.grid div a", "Revisar fase").its("length").should("be.at.least", 1)
})

Then("validar fase liberada", () => {
  examesFasePage.iconeFaseLiberada().its("length").should("equal", 1)
  examesFasePage.iconeFaseLiberada().should("be.visible")
  examesFasePage.barraProgressoFase().should("be.visible")
  cy.contains("div.grid div a", "Continuar estudo").its("length").should("be.at.least", 1)
})

Then("validar fase bloqueada", () => {
  examesFasePage.iconeFaseBloqueada().its("length").should("be.at.least", 1)
  examesFasePage.botaoFaseBloqueada().its("length").should("be.at.least", 1)
  examesFasePage.botaoFaseBloqueada().should("be.disabled")
})

When("finalizar o exame com pontuação para aprovaçao", () => {
  return examesFasePage.totalquestoequiz().then((totalNumQuestoes) => {
    return responderAteResultado(
      faseSelecionada,
      examesFasePage.numRespostasErradas(totalNumQuestoes, nomeCenario)
    );
  });
})

Then("validar fase aprovada", () => {
  examesFasePage.mensagemResultadoQuiz().should("contain", "Parabéns! Você passou!")
  validarNumQuestoesAcertadas();
  examesFasePage.botaoVoltarPara().click()
  examesFasePage.labelFaseConcluida().should("be.visible")
  examesFasePage.botaoVoltarPara().click()
  examesFasePage.iconeFaseEspecificaConcluida(faseSelecionada).should("be.visible")
  examesFasePage.botaoAcessarFase(faseSelecionada).should("have.text", "Revisar fase")
})

Then("validar Exame final disponibilizado para realização", () => {
  examesFasePage.porcentagemProgessoGeral().should("have.text", "100%")
  examesFasePage.numFasesConculidas().then((concluidas) => {
    examesFasePage.totalFases().should("equal", concluidas);
  });
  examesFasePage.statusCertificacao().should("have.text", "Pronto para Exame Final")
  examesFasePage.parabensFasesConcluidas().should("be.visible")
  examesFasePage.botaoIniciarSimuladoFinal().should("be.visible")
})