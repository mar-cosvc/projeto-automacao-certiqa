import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const And = Given;


Given("que estou na página inicial do CertiQA", () => {
  cy.visit("/");
});

When("acesso a página de login", () => {
  cy.contains("button", "Login").click();
});

Then("o formulário de login deve ser exibido", () => {
  cy.url().should("include", "/login");
  cy.contains("h1", "Acesse sua conta").should("be.visible");
  cy.get('input[placeholder="Digite seu e-mail"]').should("be.visible");
  cy.get('input[placeholder="Digite sua senha"]').should("be.visible");
  cy.contains("button", "Entrar").should("be.visible");
});

Given("que estou na página de login", () => {
  cy.visit("/login");
});

When("preencho o campo E-mail com {string}", (email) => {
  cy.get(`#email`).type(email);
});

And("preencho o campo Senha com {string}", (senha) => {
  cy.get(`#password`).type(senha);
});

And("clico no botão Entrar", () => {
  cy.contains("button", "Entrar").click();
});

Then("devo ser redirecionado para a página inicial do CertiQA", () => {
  cy.url().should("eq", `${Cypress.config("baseUrl")}painel`);
  cy.contains("div", "Login bem-sucedido").should("be.visible");
  cy.contains("div", "Bem-vindo, Usuario Teste!").should("be.visible");
});