import examesFasePage from "./pages/exames_fase.page";

Cypress.Commands.add("login", (tipoUsuario) => {
    // Cypress 16: ler segredos via cy.env([...]).then — valores só no callback, sem variáveis globais.
    // Sem tipoUsuario: credenciais flat (email/password) aprovadas nas PRs #1/#4.
    // Com tipoUsuario: perfil aninhado para cenários de Exame Final (alunoFasePendente, etc.).
    const chaves = tipoUsuario ? [tipoUsuario] : ["email", "password"];

    cy.env(chaves).then((env) => {
        const { email, password } = tipoUsuario
            ? (env[tipoUsuario] || {})
            : env;

        if (typeof email !== "string" || !email.trim()) {
            throw new Error(
                tipoUsuario
                    ? `Configure o e-mail de "${tipoUsuario}" em cypress.env.json para executar o login.`
                    : 'Configure "email" em cypress.env.json para executar o login.'
            );
        }

        if (typeof password !== "string" || !password.trim()) {
            throw new Error(
                tipoUsuario
                    ? `Configure a senha de "${tipoUsuario}" em cypress.env.json para executar o login.`
                    : 'Configure "password" em cypress.env.json para executar o login.'
            );
        }

        // Isolamento entre cenários (reinício de sessão).
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.visit("/login");
        examesFasePage.informarEmail(email);
        examesFasePage.informarSenha(password);
        examesFasePage.clicarEntrar();
        examesFasePage.validarUrl("/painel");
    });
});
