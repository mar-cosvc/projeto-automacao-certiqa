import exames_fasePage from "./pages/exames_fase.page";

Cypress.Commands.add("login",
    (email = "grupo2qapro@gmail.com", password = "teste123") => {
        cy.visit("/login");
        exames_fasePage.informarEmail(email);
        exames_fasePage.informarSenha(password);
        exames_fasePage.clicarEntrar();
        exames_fasePage.validarUrl('/painel');
    }
);