import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { faker } from '@faker-js/faker/locale/pt_BR';

const And = Given;

function emailFicticioUnico() {
  return `certiqa.${Date.now()}.${faker.string.alphanumeric(8)}@exemplo.test`.toLowerCase();
}

Given("que eu estou na página inicial do CertiQA", () => {
  cy.visit("/");
});

When("eu clico no botão ou link de cadastro", () => {
  cy.contains("button", "Cadastro").click();
});

And("preencho o campo de nome {string}", (nome) => {
  cy.get('input[placeholder="Digite seu nome completo"]')
    .clear();

  if (nome.trim() !== "") {
    cy.get('input[placeholder="Digite seu nome completo"]')
      .type(nome);
  }
});

And("preencho os demais campos com dados fictícios", () => {
  const email = emailFicticioUnico();
  const senha = "Qa1234";

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

And("clico no botão de finalizar cadastro", () => {
  cy.contains("button", "Cadastrar").click();
});

Then("devo ver a mensagem {string}", (mensagem) => {
  cy.contains("div", mensagem).should("be.visible");
});

And("preencho o campo de nome com dados fictícios", () => {
  const nome = faker.person.fullName();

  cy.get('input[placeholder="Digite seu nome completo"]')
    .clear()
    .type(nome);
});

And("preencho o campo de email {string}", (email) => {
  cy.get('input[placeholder="Digite seu e-mail"]')
    .clear();

  if (email.trim() !== "") {
    cy.get('input[placeholder="Digite seu e-mail"]')
      .type(email, { log: false });
  }
});

Then("o campo de email deve indicar um formato inválido", () => {
  cy.get('input[placeholder="Digite seu e-mail"]')
    .should(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validity.typeMismatch).to.be.true;
    });
});

And("preencho o campo de senha {string}", (senha) => {
  cy.get('input[placeholder="Digite sua senha"]')
    .type(senha, { log: false });
});

And("preencho o campo de confirmar senha {string}", (senha) => {
  cy.get('input[placeholder="Confirme sua senha"]')
    .type(senha, { log: false });
});

And("preencho o campo de email com dados fictícios", () => {
  const email = emailFicticioUnico();

  cy.get('input[placeholder="Digite seu e-mail"]')
    .clear()
    .type(email, { log: false });
});

And("preencho o campo de senha com dados fictícios", () => {
  const senha = "123456";

  cy.get('input[placeholder="Digite sua senha"]')
    .clear()
    .type(senha, { log: false });
});

And("preencho o campo de email com e-mail já cadastrado", () => {
  cy.env(["emailJaCadastrado"]).then((env) => {
    const perfil = env.emailJaCadastrado || {};
    const email = perfil.email;

    if (typeof email !== "string" || !email.trim()) {
      throw new Error(
        'Configure "emailJaCadastrado.email" em cypress.env.json para o cenário de e-mail já cadastrado.'
      );
    }

    cy.get('input[placeholder="Digite seu e-mail"]')
      .clear()
      .type(email, { log: false });
  });
});

And("preencho o campo de senha com a senha do e-mail já cadastrado", () => {
  cy.env(["emailJaCadastrado"]).then((env) => {
    const perfil = env.emailJaCadastrado || {};
    const password = perfil.password;

    if (typeof password !== "string" || !password.trim()) {
      throw new Error(
        'Configure "emailJaCadastrado.password" em cypress.env.json para o cenário de e-mail já cadastrado.'
      );
    }

    cy.get('input[placeholder="Digite sua senha"]')
      .clear()
      .type(password, { log: false });
  });
});

And("preencho o campo de confirmar senha com a senha do e-mail já cadastrado", () => {
  cy.env(["emailJaCadastrado"]).then((env) => {
    const perfil = env.emailJaCadastrado || {};
    const password = perfil.password;

    if (typeof password !== "string" || !password.trim()) {
      throw new Error(
        'Configure "emailJaCadastrado.password" em cypress.env.json para o cenário de e-mail já cadastrado.'
      );
    }

    cy.get('input[placeholder="Confirme sua senha"]')
      .clear()
      .type(password, { log: false });
  });
});
