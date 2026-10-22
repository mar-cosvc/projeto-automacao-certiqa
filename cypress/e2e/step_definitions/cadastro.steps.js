import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import { faker } from '@faker-js/faker/locale/pt_BR';

// O plugin @badeball exporta Given, When e Then.
// No Gherkin, "E" / "And" é só um atalho visual: o passo é mapeado pelo TEXTO, não pela palavra-chave.
// Criamos este alias para o time reconhecer os passos "E" com mais facilidade.
const And = Given;

//------ CADASTRO COM SUCESSO  -------

Given("que eu estou na página inicial do CertiQA", () => {
  cy.visit("/");
});

When("eu clico no botão ou link de cadastro", () => {
  cy.contains("button", "Cadastro").click();

});

// Preencher o campo de nome
And("preencho o campo de nome {string}", (nome) => {
  cy.get('input[placeholder="Digite seu nome completo"]')
    .clear();

  if (nome.trim() !== "") {
    cy.get('input[placeholder="Digite seu nome completo"]')
      .type(nome);
  }
});



// Preencher os demais campos
And("preencho os demais campos com dados fictícios", () => {
  const email = faker.internet.email();
  const senha = "Qa1234";

  cy.get('input[placeholder="Digite seu e-mail"]')
    .clear()
    .type(email);

  cy.get('input[placeholder="Digite sua senha"]')
    .clear()
    .type(senha);

  cy.get('input[placeholder="Confirme sua senha"]')
    .clear()
    .type(senha);
});

// Finalizar cadastro
And("clico no botão de finalizar cadastro", () => {
  cy.contains("button", "Cadastrar").click();
});

// Validar mensagem
Then("devo ver a mensagem {string}", (mensagem) => {
  cy.contains("div", mensagem).should("be.visible");
});

// Preencher o nome com dados fictícios
And("preencho o campo de nome com dados fictícios", () => {
  const nome = faker.person.fullName();

  cy.get('input[placeholder="Digite seu nome completo"]')
    .clear()
    .type(nome);

});

// Preencher campo email dados fictícios
And("preencho o campo de email {string}", (email) => {
  cy.get('input[placeholder="Digite seu e-mail"]')
    .clear();

  if (email.trim() !== "") {
    cy.get('input[placeholder="Digite seu e-mail"]')
      .type(email);
  }

});
// validar o email sem o @ 
Then("o campo de email deve indicar um formato inválido", () => {
  cy.get('input[placeholder="Digite seu e-mail"]')
    .should(($input) => {
      expect($input[0].checkValidity()).to.be.false;
      expect($input[0].validity.typeMismatch).to.be.true;
    });
});

//validar senha e confirmação se senha já cadastrada

And("preencho o campo de senha {string}", (senha) => {
  cy.get('input[placeholder="Digite sua senha"]')
    .type(senha);
});

And("preencho o campo de confirmar senha {string}", (senha) => {
  cy.get('input[placeholder="Confirme sua senha"]')
    .type(senha);
});

// Preencher somente o e-mail com dados fictícios
And("preencho o campo de email com dados fictícios", () => {
  const email = faker.internet.email();

  cy.get('input[placeholder="Digite seu e-mail"]')
    .clear()
    .type(email);

});

// Preencher somente a senha com dados fictícios
And("preencho o campo de senha com dados fictícios", () => {
  const senha = 123456

  cy.get('input[placeholder="Digite sua senha"]')
    .clear()
    .type(senha);
});


// // Preencher email com dados ficticios
// And("preencho o campo de email {string} válido", (email) => {
//   const email = faker.internet.email();

//   cy.get('input[placeholder="Digite seu e-mail"]')
//     .clear()
//     .type(email);
// });


// Given("que eu estou na página inicial do CertiQA", () => {
//   cy.visit("/");
// });

// When("eu clico no botão ou link de cadastro", () => {
//   cy.contains("button", "Cadastro").click();

// });

// And("preencho os campos com dados fictícios", () => {
//   const nome = faker.person.fullName();
//   const email = faker.internet.email();
//   const senha = "Qa1234";

//   cy.get('input[placeholder="Digite seu nome completo"]')
//     .type(nome);

//   cy.get('input[placeholder="Digite seu e-mail"]')
//     .type(email);

//   cy.get('input[placeholder="Digite sua senha"]')
//     .type(senha);

//   cy.get('input[placeholder="Confirme sua senha"]')
//     .type(senha);
// });

// And("clico no botão de finalizar cadastro", () => {
//   cy.contains("button", "Cadastrar").click();
// });

// Then("devo ver a mensagem {string}", (mensagem) => {
//   cy.contains("div", mensagem)
//     .should("be.visible");
// });


//----- CADASTRO APENAS COM O PRIMEIRO NOME -----

// And("preencho os campos de email e senha com dados fictícios", () => {
//   const email = faker.internet.email();
//   const senha = "Qa1234";

//   cy.get('input[placeholder="Digite seu e-mail"]')
//     .type(email);

//   cy.get('input[placeholder="Digite sua senha"]')
//     .type(senha);

//   cy.get('input[placeholder="Confirme sua senha"]')
//     .type(senha);
// });

// And("preencho o campo de nome {string}", (nome) => {
// cy.get('input[placeholder="Digite seu nome completo"]').clear().type(nome);
// });


// //And("clico no botão de finalizar cadastro", () => {
// //   cy.contains("button", "Cadastrar").click();

// // });

// // //--------------- CADASTRO COM NÚMEROS NO LUGAR DO NOME ---------

// // Given("que eu estou na página inicial do CertiQA", () => {
// //   cy.visit("/");
// // });

// // When("eu clico no botão ou link de cadastro", () => {
// //   cy.contains("button", "Cadastro").click();

// // });


// // And("preencho os campos com dados fictícios", () => {
// //  const email = faker.internet.email();
// // const senha = "Qa1234";

// // cy.get('input[placeholder="Digite seu e-mail"]')
// //  .type(email);

// //  cy.get('input[placeholder="Digite sua senha"]')
// // .type(senha);

// // cy.get('input[placeholder="Confirme sua senha"]')
// //   .type(senha);

// // });

// And("preencho o campo de nome {string}", (nome) => {
//    cy.get('input[placeholder="Digite seu nome completo"]').clear().type(nome);
// });


// //And("clico no botão de finalizar cadastro", () => {
//   //cy.contains("button", "Cadastrar").click();

// //});




// // //------ CADASTRO SEM O NOME  -------

// // Given("que eu estou na página inicial do CertiQA", () => {
// //   cy.visit("/");
// // });

// // When("eu clico no botão ou link de cadastro", () => {
// //   cy.contains("button", "Cadastro").click();

// // });

// // And("preencho o campo de nome {string}", (nome) => {
// //   cy.get('input[placeholder="Digite seu nome completo"]').type(nome);
// // });

// // And("preencho os campos com dados fictícios", () => {
// //   const email = faker.internet.email();
// //   const senha = "Qa1234";

// //   cy.get('input[placeholder="Digite seu e-mail"]')
// //     .type(email);

// //   cy.get('input[placeholder="Digite sua senha"]')
// //     .type(senha);

// //   cy.get('input[placeholder="Confirme sua senha"]')
//     .type(senha);

// });

// And("clico no botão de finalizar cadastro", () => {
//   cy.contains("button", "Cadastrar").click();

// });

// Then("devo ver a mensagem {string}", (mensagem) => {
//   cy.contains("p", mensagem).should("be.visible");
// });

// //------ CADASTRO SEM O EMAIL -------

// Given("que eu estou na página inicial do CertiQA", () => {
//   cy.visit("/");
// });

// When("eu clico no botão ou link de cadastro", () => {
//   cy.contains("button", "Cadastro").click();

// });

// And("preencho os campos com dados fictícios", () => {
//   const nome = faker.person.fullName();
//   const senha = "Qa1234";

//   cy.get('input[placeholder="Digite seu nome completo"]')
//     .type(nome);

//   cy.get('input[placeholder="Digite sua senha"]')
//     .type(senha);

//   cy.get('input[placeholder="Confirme sua senha"]')
//     .type(senha);

// });

// And("clico no botão de finalizar cadastro", () => {
//   cy.contains("button", "Cadastrar").click();

// });

// Then("devo ver a mensagem {string}", (mensagem) => {
//   cy.contains("p", mensagem).should("be.visible");
// });

// //------------- CADASTRO COM EMAIL INVÁLIDO --------

// Given("que eu estou na página inicial do CertiQA", () => {
//   cy.visit("/");
// });

// When("eu clico no botão ou link de cadastro", () => {
//   cy.contains("button", "Cadastro").click();

// });

// And("preencho os campos com dados fictícios", () => {
//   const nome = faker.person.fullName();
//   const senha = "Qa1234";

//   cy.get('input[placeholder="Digite seu nome completo"]')
//     .type(nome);

//   cy.get('input[placeholder="Digite sua senha"]')
//     .type(senha);

//   cy.get('input[placeholder="Confirme sua senha"]')
//     .type(senha);

// });

// And("preencho o campo de email {string}", (email) => {
// cy.get('input[placeholder="Digite seu e-mail"]').type(email);
// });


// And("clico no botão de finalizar cadastro", () => {
//   cy.contains("button", "Cadastrar").click();

// });

// Then("devo ver a mensagem {string}", (mensagem) => {
//   cy.contains("p",(mensagem))
//     .should("be.visible");
// });


// //--------------- CADASTRO SEM O @ -----

// Given("que eu estou na página inicial do CertiQA", () => {
//   cy.visit("/");
// });

// When("eu clico no botão ou link de cadastro", () => {
//   cy.contains("button", "Cadastro").click();

// });

// And("preencho os campos com dados fictícios", () => {
//   const nome = faker.person.fullName();
//   const senha = "Qa1234";

//   cy.get('input[placeholder="Digite seu nome completo"]')
//     .type(nome);

//   cy.get('input[placeholder="Digite sua senha"]')
//     .type(senha);

//   cy.get('input[placeholder="Confirme sua senha"]')
//     .type(senha);

// });

// And("preencho o campo de email {string}", (email) => {
//   cy.get('input[placeholder="Digite seu e-mail"]').type(email);
// });


// And("clico no botão de finalizar cadastro", () => {
//   cy.contains("button", "Cadastrar").click();

// });

// Then("devo ver a mensagem {string}", (mensagem) => {
//   cy.get('input[placeholder="Digite seu e-mail"]')
//     .should(($input) => {
//       expect($input[0].checkValidity()).to.be.false;
//       expect($input[0].validity.typeMismatch).to.be.true;
//     });
// });



// //---------------- CADASTRO COM SENHA VAZIAS  ----------

// Given("que eu estou na página inicial do CertiQA", () => {
//   cy.visit("/");
// });

// When("eu clico no botão ou link de cadastro", () => {
//   cy.contains("button", "Cadastro").click();
// });

// And("preencho os campos com dados fictícios", () => {
//   const nome = faker.person.fullName();
//   const email = faker.internet.email();


//   cy.get('input[placeholder="Digite seu nome completo"]')
//     .type(nome);

//   cy.get('input[placeholder="Digite seu e-mail"]')
//     .type(email);

// });

// And("clico no botão de finalizar cadastro", () => {
//   cy.contains("button", "Cadastrar").click();

// });

// Then("devo ver a mensagem {string}", (mensagem) => {
//   cy.contains("p", mensagem).should("be.visible");

// });

// //------ CADASTRO COM CONFIRMAÇÃO DE SENHA VAZIA OU ERRADA ------

// Given("que eu estou na página inicial do CertiQA", () => {
//   cy.visit("/");
// });

// When("eu clico no botão ou link de cadastro", () => {
//   cy.contains("button", "Cadastro").click();
// });

// And("preencho os campos com dados fictícios", () => {
//   const nome = faker.person.fullName();
//   const email = faker.internet.email();
//   const senha = "Qa1234";

//   cy.get('input[placeholder="Digite seu nome completo"]')
//     .type(nome);

//   cy.get('input[placeholder="Digite seu e-mail"]')
//     .type(email);

//   cy.get('input[placeholder="Digite sua senha"]')
//     .type(senha);

// });

// And("clico no botão de finalizar cadastro", () => {
//   cy.contains("button", "Cadastrar").click();

// });

// Then("devo ver a mensagem {string}", (mensagem) => {
//   cy.contains("p", mensagem).should("be.visible");

// });

// //------------------ CENÁRIOS COM CAMPOS VAZIOS -------


// Given("que eu estou na página inicial do CertiQA", () => {
//   cy.visit("/");
// });

// When("eu clico no botão ou link de cadastro", () => {
//   cy.contains("button", "Cadastro").click();
// });

// And("clico no botão de finalizar cadastro", () => {
//   cy.contains("button", "Cadastrar").click();

// });

// Then("devo ver a mensagem {string}", (mensagem) => {
//   cy.contains("p", mensagem).should("be.visible");

// });

// //------------- E-MAIL JÁ CADASTRADO ----------

// Given("que eu estou na página inicial do CertiQA", () => {
//   cy.visit("/");
// });

// When("eu clico no botão ou link de cadastro", () => {
//   cy.contains("button", "Cadastro").click();
// });

// And("preencho o campo de nome {string}", (nome) => {
//   cy.get('input[placeholder="Digite seu nome completo"]')
//     .type(nome);
// });

// And("preencho o campo de email {string} válido", (email) => {
//   cy.get('input[placeholder="Digite seu e-mail"]')
//     .type(email);
// });

// And("preencho o campo de senha {string}", (senha) => {
//   cy.get('input[placeholder="Digite sua senha"]')
//     .type(senha);
// });

// And("preencho o campo de confirmar senha {string}", (senha) => {
//   cy.get('input[placeholder="Confirme sua senha"]')
//     .type(senha);
// });

// And("clico no botão de finalizar cadastro", () => {
//   cy.contains("button", "Cadastrar").click();
// });

// Then("devo ver a mensagem {string}", (mensagem) => {
//   cy.contains(mensagem)
//     .should("be.visible");
// });
