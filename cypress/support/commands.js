import examesFasePage from "./pages/exames_fase.page";
import { carregarCredenciais } from "./data/perfis.mjs";

Cypress.Commands.add("login", (tipoUsuario) => {
  // Cypress 16 + Mass Factory (perfis): credenciais só via cy.env no callback.
  // Sem tipoUsuario → perfil lógico "login" (email/password flat).
  // Com tipoUsuario → alunoCompleto | alunoFasePendente | alunoReprovado.
  const perfilId = tipoUsuario || "login";

  carregarCredenciais(perfilId).then(({ email, password }) => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/login");
    examesFasePage.informarEmail(email);
    examesFasePage.informarSenha(password);
    examesFasePage.clicarEntrar();
    examesFasePage.validarUrl("/painel");
  });
});
