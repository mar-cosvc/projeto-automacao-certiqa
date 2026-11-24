import { Before, Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import {
  criarEstadoCenarioCadastro,
  gerarMassaCadastroPositiva,
  gerarNomeCompleto,
  gerarEmailUnico,
  gerarSenhaLimiarMinimo,
  gerarSenhaValida,
} from "../../support/data/massas.mjs";
import { carregarCredenciais } from "../../support/data/perfis.mjs";

const And = Given;

/** Estado isolado por cenário — senha fictícia do fluxo de e-mail já cadastrado. */
const estadoCenario = criarEstadoCenarioCadastro();

Before(() => {
  estadoCenario.limpar();
});

/**
 * Cypress 16: domínio autorizado via cy.env([...]), passado às funções puras.
 * @returns {Cypress.Chainable<string>}
 */
function resolverDominioEmail() {
  return cy.env(["emailDomain"]).then((env) => {
    const dominio = String(env.emailDomain || "")
      .trim()
      .replace(/^@/, "");
    if (!dominio) {
      throw new Error(
        'Domínio de e-mail não configurado. Defina "emailDomain" em cypress.env.json ' +
          "(domínio autorizado pelo time). Não assuma que @exemplo.test será aceito pelo backend."
      );
    }
    return dominio;
  });
}

Given("que eu estou na página inicial do CertiQA", () => {
  cy.visit("/");
});

When("eu clico no botão ou link de cadastro", () => {
  cy.contains("button", "Cadastro").click();
});

And("preencho o campo de nome {string}", (nome) => {
  cy.get('input[placeholder="Digite seu nome completo"]').clear();

  if (nome.trim() !== "") {
    cy.get('input[placeholder="Digite seu nome completo"]').type(nome);
  }
});

And("preencho os demais campos com dados fictícios", () => {
  resolverDominioEmail().then((dominio) => {
    const { email, senha } = gerarMassaCadastroPositiva({ dominio });

    cy.get('input[placeholder="Digite seu e-mail"]')
      .clear()
      .type(email, { log: false });

    cy.get('input[placeholder="Digite sua senha"]')
      .clear()
      .type(senha, { log: false });

    cy.get('input[placeholder="Confirme sua senha"]')
      .clear()
      .type(senha, { log: false });
  });
});

And("clico no botão de finalizar cadastro", () => {
  cy.contains("button", "Cadastrar").click();
});

Then("devo ver a mensagem {string}", (mensagem) => {
  cy.contains("div", mensagem).should("be.visible");
});

And("preencho o campo de nome com dados fictícios", () => {
  const nome = gerarNomeCompleto();

  cy.get('input[placeholder="Digite seu nome completo"]')
    .clear()
    .type(nome);
});

And("preencho o campo de email {string}", (email) => {
  cy.get('input[placeholder="Digite seu e-mail"]').clear();

  if (email.trim() !== "") {
    cy.get('input[placeholder="Digite seu e-mail"]').type(email, {
      log: false,
    });
  }
});

Then("o campo de email deve indicar um formato inválido", () => {
  cy.get('input[placeholder="Digite seu e-mail"]').should(($input) => {
    expect($input[0].checkValidity()).to.be.false;
    expect($input[0].validity.typeMismatch).to.be.true;
  });
});

And("preencho o campo de senha {string}", (senha) => {
  cy.get('input[placeholder="Digite sua senha"]').type(senha, { log: false });
});

And("preencho o campo de confirmar senha {string}", (senha) => {
  cy.get('input[placeholder="Confirme sua senha"]').type(senha, {
    log: false,
  });
});

And("preencho o campo de email com dados fictícios", () => {
  resolverDominioEmail().then((dominio) => {
    const email = gerarEmailUnico({ dominio });

    cy.get('input[placeholder="Digite seu e-mail"]')
      .clear()
      .type(email, { log: false });
  });
});

And("preencho o campo de senha com dados fictícios", () => {
  const senha = gerarSenhaLimiarMinimo();

  cy.get('input[placeholder="Digite sua senha"]')
    .clear()
    .type(senha, { log: false });
});

And("preencho o campo de email com e-mail já cadastrado", () => {
  carregarCredenciais("emailJaCadastrado").then(({ email }) => {
    cy.get('input[placeholder="Digite seu e-mail"]')
      .clear()
      .type(email, { log: false });
  });
});

// Duplicidade é validada pelo e-mail. Senha/confirmação: fictícias iguais (Mass Factory).
And("preencho o campo de senha com a senha do e-mail já cadastrado", () => {
  const senha = estadoCenario.guardarSenhaDuplicidade(gerarSenhaValida());
  cy.get('input[placeholder="Digite sua senha"]')
    .clear()
    .type(senha, { log: false });
});

And(
  "preencho o campo de confirmar senha com a senha do e-mail já cadastrado",
  () => {
    const senha = estadoCenario.obterSenhaDuplicidade();
    cy.get('input[placeholder="Confirme sua senha"]')
      .clear()
      .type(senha, { log: false });
  }
);
