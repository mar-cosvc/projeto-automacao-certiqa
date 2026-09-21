import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("que estou na página inicial", () => {
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
