import examesFasePage from "./pages/exames_fase.page";

Cypress.Commands.add("login",
    () => {
        cy.env(["email", "password"]).then(({ email, password }) => {
            if (typeof email !== "string" || !email.trim()) {
                throw new Error('Configure "email" em cypress.env.json para executar o login.');
            }

            if (typeof password !== "string" || !password.trim()) {
                throw new Error('Configure "password" em cypress.env.json para executar o login.');
            }

            cy.visit("/login");
            examesFasePage.informarEmail(email);
            examesFasePage.informarSenha(password);
            examesFasePage.clicarEntrar();
            examesFasePage.validarUrl('/painel');
        });
    });