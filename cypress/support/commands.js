import examesFasePage from "./pages/exames_fase.page";

Cypress.Commands.add("login", (tipoUsuario = "alunoCompleto") => {
    cy.env([tipoUsuario]).then((usuarios) => {
        const { email, password } = usuarios[tipoUsuario] || {};

        if (typeof email !== "string" || !email.trim()) {
            throw new Error(`Configure o e-mail de ${tipoUsuario} em cypress.env.json para executar o login.`);
        }
        if (typeof password !== "string" || !password.trim()) {
            throw new Error(`Configure a senha de ${tipoUsuario} em cypress.env.json para executar o login.`);
        }

        cy.clearCookies();
        cy.clearLocalStorage();
        cy.visit("/login");
        examesFasePage.informarEmail(email);
        examesFasePage.informarSenha(password);
        examesFasePage.clicarEntrar();
        examesFasePage.validarUrl('/painel');
    });
});