import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// O plugin @badeball exporta Given, When e Then.
// No Gherkin, "E" / "And" é só um atalho visual: o passo é mapeado pelo TEXTO, não pela palavra-chave.
// Criamos este alias para o time reconhecer os passos "E" com mais facilidade.
const And = Given;

Given("que eu estou na página inicial do CertiQA", () => {
  // Abre a página inicial usando a baseUrl configurada em cypress.config.js
  // cy.visit("/");
});

When("eu clico no botão ou link de cadastro", () => {
  // Localize o seletor real na tela (DevTools do navegador ou Cypress Selector Playground)
  // cy.contains("button", "Cadastro").click();
  // cy.contains("a", "Cadastre-se").click();
});

And("preencho o campo de nome com {string}", (nome) => {
  // O valor entre aspas no .feature chega automaticamente neste parâmetro
  // cy.get('input[name="name"]').clear().type(nome);
  // cy.get('input[placeholder="Digite seu nome"]').type(nome);
});

And("preencho o campo de email com um email válido", () => {
  // Gere um e-mail único para não colidir com cadastros já existentes
  // const email = `aluno.qa.${Date.now()}@teste.com`;
  // cy.get('input[type="email"]').clear().type(email);
  // cy.get('input[placeholder="Digite seu e-mail"]').type(email);
});

And("preencho o campo de senha com {string}", (senha) => {
  // cy.get('input[type="password"]').clear().type(senha);
  // cy.get('input[placeholder="Digite sua senha"]').type(senha);
});

And("clico no botão de finalizar cadastro", () => {
  // cy.contains("button", "Cadastrar").click();
  // cy.get('button[type="submit"]').click();
});

And("deixo o campo de email em branco", () => {
  // Garante que o campo existe e permanece vazio
  // cy.get('input[type="email"]').clear();
});

Then("devo ver uma mensagem de sucesso ou ser direcionado para o painel do usuário", () => {
  // Ajuste o seletor/URL conforme o comportamento real da aplicação
  // cy.contains("Cadastro realizado").should("be.visible");
  // cy.url().should("include", "/painel");
});

Then("o sistema deve exibir um alerta informando que o email é obrigatório", () => {
  // Pode ser mensagem na tela, texto de validação HTML ou tooltip
  // cy.contains(/e-?mail.*(obrigatório|necessário)/i).should("be.visible");
  // cy.get('input[type="email"]').then(($input) => {
  //   expect($input[0].validationMessage).to.not.eq("");
  // });
});
