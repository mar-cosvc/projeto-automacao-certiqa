/// <reference types="cypress" />
import questoesCtflExameFinal from "../../fixtures/questoes_ctfl_simulado_final.json";
import questoesCtflAtExameFinal from "../../fixtures/questoes_ctflAt_simulado_final.json";
import certificacoes from "../../fixtures/certificacoes.json";
import questoesSimuladoFinal from "../../fixtures/questoes_ctfl_simulado_final.json";
import questoesAgileSimuladoFinal from "../../fixtures/questoes_agile_simulado_final.json";
import examesFasePage from "./exames_fase.page";

const questoesSimuladoFinalPorCertificacao = {
  CTFL: questoesSimuladoFinal,
  "Agile Tester": questoesAgileSimuladoFinal,
};

const questoesExameFinalPorCertificacao = [
  ...Object.values(questoesCtflExameFinal),
  ...Object.values(questoesCtflAtExameFinal),
];

// Regra de negócio CertiQA: Exame Final exige pelo menos 80% de acertos.
const porcAprovacao = 0.8;
let totalNumQuestoes;
let numRespostasErradas;
let respostasErradasRealizadas = 0;

function normalizarPergunta(pergunta) {
  return pergunta
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['"“”‘’]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Mínimo de acertos e erros-alvo para fronteiras 80% (ex.: 40 questões → 32/31/33). */
function errosAlvoPorCenario(totalQuestoes, nomeCenario) {
  const minimoAcertos = Math.ceil(totalQuestoes * porcAprovacao);
  const maxErrosParaAprovacao = totalQuestoes - minimoAcertos;

  if (nomeCenario.includes("inferior")) {
    return Math.min(maxErrosParaAprovacao + 1, totalQuestoes);
  }
  if (
    nomeCenario.includes("igual") ||
    nomeCenario.includes("Concluir exame com sucesso")
  ) {
    return maxErrosParaAprovacao;
  }
  if (
    nomeCenario.includes("superior") ||
    nomeCenario.includes("Concluir fase com sucesso")
  ) {
    return Math.max(maxErrosParaAprovacao - 1, 0);
  }
  if (nomeCenario.includes("100%")) {
    return 0;
  }
  throw new Error(`Cenário "${nomeCenario}" não define a pontuação do exame final.`);
}

class ExamesFinalPage {

  questoesExameFinal() {
    return cy.get(".space-y-6")
  }

  contadorTempoExameFinal() {
    return cy.get("div > svg + span")
  }

  alternativasExameFinal() {
    return cy.get("[role='radiogroup'] div.p-4")
  }

  totalQuestoesExameFinal() {
    return this.questoesExameFinal().its("length")
  }

  mensagemResultadoExameFinal() {
    return cy.get(".text-4xl")
  }

  textoResultadoExameFinal() {
    return cy.get(".text-center .mt-2")
  }

  exibirQuestaoCentroTela(indice) {
    if (Number.isInteger(indice)) {
      return this.questoesExameFinal()
        .eq(indice)
        .scrollIntoView({ block: "center" });
    }

    return this.questoesExameFinal().each(($el) =>
      cy.wrap($el).scrollIntoView({ block: "center" })
    );
  }

  buscarQuestaoAtualExameFinal(indice) {
    return this.exibirQuestaoCentroTela(indice)
      .find("p")
      .invoke("text")
      .then((texto) => {
        const perguntaAtual = normalizarPergunta(texto);
        const questao = questoesExameFinalPorCertificacao.find(
          (item) =>
            typeof item.pergunta === "string" &&
            normalizarPergunta(item.pergunta) === perguntaAtual
        );

        expect(questao, `Pergunta encontrada no fixture: "${texto.trim()}"`).to.exist;
        return questao;
      });
  }

  responderQuestaoCorretamenteExameFinal(indice, questaoAtual) {
    const questaoEncontrada = questaoAtual
      ? cy.wrap(questaoAtual)
      : this.buscarQuestaoAtualExameFinal(indice);

    return questaoEncontrada.then((questao) => {
      const respostaCorreta = questao["resposta-correta"];
      expect(respostaCorreta, "Resposta correta encontrada no fixture")
        .to.be.a("string")
        .and.not.empty;

      return this.questoesExameFinal()
        .eq(indice)
        .contains("[role='radiogroup'] div.p-4", respostaCorreta)
        .click();
    });
  }

  responderQuestaoCorretamente() {
    return this.questoesExameFinal()
      .first()
      .within(() => this.responderQuestaoSimuladoFinal(true));
  }

  progressoMenor100() {
    cy.get("span.text-sm.font-medium").first().invoke('text').then((text) => {
      const valorNumerico = parseFloat(text.replace("%", "").trim());
      expect(valorNumerico).to.be.lessThan(100);
    });
  }

  semAcessoSimuladoFinal() {
    cy.contains('Iniciar Simulado Final').should('not.exist');
  }

  validarFasesConcluidas() {
    cy.get("span.text-sm.font-medium").first().should('be.visible').should('have.text', '100%');
  }

  validarAprovado() {
    cy.contains(/Pronto para Exame Final|Concluído/i).should('be.visible');
  }

  tentarAcessarSimulado() {
    examesFasePage.botaoIniciarSimuladoFinal().should("not.exist");
  }

  aguardarQuestoesDoQuiz() {
    cy.get("div.space-y-2 label").should("have.length.at.least", 2);
  }

  completarFasesAprovandoExcetoUltima(certificacao) {
    const fases = certificacoes[certificacao];

    if (!fases) {
      throw new Error(`Certificação não encontrada nos dados de fases: "${certificacao}".`);
    }

    // Completa todas as fases, menos a última, para deixar uma fase pendente.
    const fasesParaCompletar = Object.values(fases).slice(0, -1);

    fasesParaCompletar.forEach((dadosFase) => {
      // Abre a fase e inicia o quiz correspondente.
      cy.contains(dadosFase.titulo)
        .parent()
        .parent()
        .contains(/Iniciar estudo|Revisar fase|Continuar estudo/i)
        .should("be.visible")
        .click({ force: true });

      examesFasePage.abrirQuiz();
      this.aguardarQuestoesDoQuiz();

      // Seleciona o gabarito e avança até a última questão.
      dadosFase.gabarito.forEach((resposta, index) => {
        cy.contains("label", resposta)
          .scrollIntoView()
          .should("be.visible")
          .click({ force: true });

        const existeProximaQuestao = index + 1 < dadosFase.gabarito.length;
        if (existeProximaQuestao) {
          cy.contains("button", "Próxima")
            .scrollIntoView()
            .should("be.visible")
            .click({ force: true });
        }
      });

      // Confirma a aprovação e retorna à lista de fases.
      examesFasePage.finalizarExame();
      cy.contains("Parabéns! Você passou!").should("be.visible");
      cy.contains("button", "Voltar para a Fase").should("be.visible").click({ force: true });
      cy.contains("h3", "Conteúdo da Fase").should("be.visible");
      examesFasePage.botaoVoltarPara().should("be.visible").click({ force: true });
    });
  }

  reprovarUltimaFase(certificacao) {
    const fases = certificacoes[certificacao];
    if (!fases) {
      throw new Error(`Certificação não encontrada nos dados de fases: "${certificacao}".`);
    }

    const nomesFases = Object.keys(fases);
    const ultimaFase = nomesFases[nomesFases.length - 1];

    // Primeiro aprova todas as fases anteriores e deixa a última pendente.
    this.completarFasesAprovandoExcetoUltima(certificacao);

    // Depois abre a última fase e responde apenas metade das questões corretamente.
    examesFasePage.selecionarFase(ultimaFase);
    this.aguardarQuestoesDoQuiz();
    examesFasePage.responderQuestoesPercentual(0.5);
    examesFasePage.finalizarExame();

    // Confirma que o resultado é de reprovação e que o quiz pode ser tentado novamente.
    examesFasePage.mensagemResultadoQuiz().should("contain", "Você precisa de pelo menos");
    examesFasePage.botaoAzul().should("be.visible").and("have.text", "Tentar Novamente");
  }

  clicarIniciarExameFinal() {
    examesFasePage.botaoIniciarSimuladoFinal().should("be.visible").click();
    cy.location("pathname").should("include", "/exame-final");
  }

  iniciarSimulado() {
    cy.get("body").should("not.contain", "Carregando exame final");
    cy.contains('button', 'Iniciar Simulado').should('be.visible').click({ force: true });
  }

  validaElementoCronometro() {
    cy.get('svg.lucide.lucide-clock').should('be.visible');
  }

  validaTempo() {
    cy.get('span.font-mono')
      .should('be.visible')
      .invoke('text')
      .then((tempoInicial) => {
        cy.get('span.font-mono')
          .should('be.visible')
          .invoke('text')
          .should((tempoAtual) => {
            expect(tempoAtual.trim()).to.not.equal(tempoInicial.trim());
          });
      });
  }

  normalizarTexto(texto) {
    return texto
      ? texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
      : "";
  }

  buscarQuestaoSimuladoFinal(textoPergunta, certificacao = examesFasePage.certificacaoAtual) {
    const perguntaNormalizada = this.normalizarTexto(textoPergunta);
    const questoes = questoesSimuladoFinalPorCertificacao[certificacao];

    if (!questoes) {
      throw new Error(`Certificação sem gabarito de Exame Final: "${certificacao}".`);
    }

    // Primeiro tenta encontrar a pergunta no arquivo JSON da certificação.
    const questaoEncontrada = Object.values(questoes).find((questao) => {
      const textoPergunta = questao.pergunta;
      return this.normalizarTexto(textoPergunta) === perguntaNormalizada;
    });

    if (questaoEncontrada) {
      return questaoEncontrada;
    }

    // Algumas perguntas do CTFL têm variações de texto; nesses casos, usa este gabarito auxiliar.
    if (certificacao !== "CTFL") {
      return undefined;
    }

    const respostasVariantes = {
      "qual das seguintes atividades e parte do processo de teste":
        "Planejamento de teste",
      "qual das seguintes e uma atividade de teste estatico": "Revisão de código",
      "na analise de valor limite quais valores sao testados": "limites entre partições",
      "qual e um beneficio chave do uso de ferramentas de automacao de teste":
        "Executar testes repetitivos de forma consistente e rápida",
      "quem tipicamente lidera o planejamento de teste monitoramento e controle":
        "Gerente de teste",
      "o que e uma abordagem de teste baseada em risco":
        "Priorizar testes com base nos riscos identificados",
      "qual das seguintes afirmacoes descreve corretamente o principio teste exaustivo e impossivel":
        "Testar todas as combinações de entradas e pré-condições é impraticável, exceto em casos triviais",
      "qual tipo de revisao e caracterizado por ser conduzido pelo autor do documento":
        "Walkthrough",
      "qual das seguintes opcoes descreve corretamente o paradoxo do pesticida":
        "Os mesmos testes repetidos eventualmente não encontrarão novos defeitos",
      "qual das seguintes nao e um tipo de teste de caixa preta":
        "Teste de cobertura de declaração",
      "em um modelo de desenvolvimento em cascata quando geralmente ocorre o teste de sistema":
        "Após o desenvolvimento e integração estarem completos",
    };
    const resposta = respostasVariantes[perguntaNormalizada];

    return resposta ? { "resposta-correta": resposta } : undefined;
  }

  obterRespostaCorreta(questao) {
    return (
      questao["resposta-correta"]
    );
  }

  validarQuestoesContempladas(certificacao = examesFasePage.certificacaoAtual) {
    const fases = certificacoes[certificacao];
    if (!fases) {
      throw new Error(`Certificação não encontrada nos dados de fases: "${certificacao}".`);
    }

    // Ignora palavras comuns e compara apenas termos importantes.
    const palavrasIgnoradas = new Set([
      "para", "pela", "pelo", "com", "das", "dos", "uma", "que", "quando",
      "como", "mais", "entre", "sobre", "cada", "deve", "dever", "sao",
      "ser", "ter", "qual", "quais", "onde", "porque", "todo", "toda",
    ]);
    const palavrasChave = (texto) =>
      this.normalizarTexto(texto)
        .split(" ")
        .filter((palavra) => palavra.length > 3 && !palavrasIgnoradas.has(palavra));

    const respostaCombinaComQuestao = (resposta, textoQuestao) => {
      const palavrasResposta = [...new Set(palavrasChave(resposta))];
      if (palavrasResposta.length === 0) {
        return false;
      }

      const textoQuestaoNormalizado = palavrasChave(textoQuestao).join(" ");
      const palavrasEncontradas = palavrasResposta.filter((palavra) =>
        textoQuestaoNormalizado.includes(palavra)
      ).length;
      const minimoDePalavras = Math.min(2, palavrasResposta.length);
      // calcula quantas palavras representa metade da resposta, arredondando para cima
      const metadeDaResposta = Math.ceil(palavrasResposta.length / 2);

      return palavrasEncontradas >= minimoDePalavras &&
        palavrasEncontradas >= metadeDaResposta;
    };

    const fasesContempladas = new Set();

    cy.get(".space-y-6")
      .should("have.length", 40)
      .each(($questao) => {
        const textoQuestao = $questao.text();

        Object.entries(fases).forEach(([nomeFase, dadosFase]) => {
          const faseEncontrada = dadosFase.gabarito.some((resposta) =>
            respostaCombinaComQuestao(resposta, textoQuestao)
          );

          if (faseEncontrada) {
            fasesContempladas.add(nomeFase);
          }
        });
      })
      .then(() => {
        const fasesNaoEncontradas = Object.keys(fases).filter(
          (nomeFase) => !fasesContempladas.has(nomeFase)
        );

        expect(
          fasesNaoEncontradas,
          `Fases não contempladas no Exame Final: ${fasesNaoEncontradas.join(", ")}`
        ).to.be.empty;
      });
  }

  // Deve ser chamado dentro do card da questão que será respondida.
  responderQuestaoSimuladoFinal(deveAcertar) {
    return cy.get("p")
      .not(":contains('Questão')")
      .filter(":visible")
      .first()
      .invoke("text")
      .then((textoPerguntaTela) => {
        const questao = this.buscarQuestaoSimuladoFinal(textoPerguntaTela);

        if (!questao) {
          throw new Error(`Pergunta não encontrada no JSON do simulado final: "${textoPerguntaTela}"`);
        }

        const respostaCorreta = this.obterRespostaCorreta(questao);
        if (!respostaCorreta) {
          throw new Error(`Resposta correta não cadastrada para a pergunta: "${textoPerguntaTela}"`);
        }

        const respostaNormalizada = this.normalizarTexto(respostaCorreta);

        cy.get("label").then(($labels) => {
          const alternativas = [...$labels];
          const alternativaCorreta = alternativas.find((label) => {
            const textoAlternativa = this.normalizarTexto(label.textContent);
            return textoAlternativa === respostaNormalizada;
          }) || alternativas.find((label) =>
            this.normalizarTexto(label.textContent).includes(respostaNormalizada)
          );

          if (!alternativaCorreta) {
            throw new Error(`Alternativa correta não encontrada: "${respostaCorreta}".`);
          }

          const alternativaEscolhida = deveAcertar
            ? alternativaCorreta
            : alternativas.find((label) => label !== alternativaCorreta);

          if (!alternativaEscolhida) {
            throw new Error(`Alternativa incorreta não encontrada para a pergunta: "${textoPerguntaTela}".`);
          }

          cy.wrap(Cypress.$(alternativaEscolhida))
            .should("be.visible")
            .click({ force: true });
        });
      });
  }

  reiniciarEstadoCenario() {
    totalNumQuestoes = undefined;
    numRespostasErradas = undefined;
    respostasErradasRealizadas = 0;
  }

  // Responde corretamente as primeiras questões necessárias para atingir a porcentagem pedida.
  responderSimuladoFinalPorPorcentagem(percentualAprovacao) {
    const totalQuestoes = 40;
    const quantidadeAcertos = Math.ceil(totalQuestoes * percentualAprovacao);

    cy.get(".space-y-6")
      .should("have.length", totalQuestoes)
      .each(($card) => {
        const textoCard = $card.text();
        const numeroEncontrado = textoCard.match(/Questão\s+(\d+)\s+de\s+40/i);

        if (!numeroEncontrado) {
          throw new Error("Não foi possível identificar o número da questão do Exame Final.");
        }

        const numeroQuestao = Number(numeroEncontrado[1]);
        const deveAcertar = numeroQuestao <= quantidadeAcertos;

        cy.wrap($card)
          .scrollIntoView({ block: "center" })
          .within(() => this.responderQuestaoSimuladoFinal(deveAcertar));
      });

    cy.contains("button", /^Enviar Simulado/)
      .scrollIntoView()
      .should("be.visible")
      .click({ force: true });
  }

  validaFaseNaoConcluida() {
    cy.contains("div.grid div a", "Continuar estudo").should("be.visible");
  }

  validarResultadoFinal() {
    cy.contains("body", "80%").should("be.visible");
    cy.contains("body", /aprovado/i).should("be.visible");
  }

  validarAprovacaoFinal() {
    cy.contains("Parabéns!").should("be.visible");
  }

  responderQuestaoIncorretamenteExameFinal(indice, questaoAtual) {
    const questaoEncontrada = questaoAtual
      ? cy.wrap(questaoAtual)
      : this.buscarQuestaoAtualExameFinal(indice);

    return questaoEncontrada.then((questao) => {
      const respostaCorreta = questao["resposta-correta"];
      expect(respostaCorreta, "Resposta correta encontrada no fixture")
        .to.be.a("string")
        .and.not.empty;

      return this.questoesExameFinal()
        .eq(indice)
        .find("[role='radiogroup'] div.p-4")
        .should("have.length.at.least", 2)
        .filter(
          (_, alternativa) =>
            normalizarPergunta(alternativa.innerText) !== normalizarPergunta(respostaCorreta)
        )
        .first()
        .should("exist")
        .click();
    });
  }

  finalizarExameFinal(indice, nomeCenario) {
    if (indice === 0) {
      this.reiniciarEstadoCenario();
    }

    const obterTotalQuestoes = totalNumQuestoes === undefined
      ? this.totalQuestoesExameFinal().then((totalQuestoes) => {
        totalNumQuestoes = totalQuestoes;
        return totalQuestoes;
      })
      : cy.wrap(totalNumQuestoes);

    return obterTotalQuestoes.then((totalQuestoes) => {
      if (numRespostasErradas === undefined) {
        numRespostasErradas = errosAlvoPorCenario(totalQuestoes, nomeCenario);
        cy.log(`Exame Final: ${numRespostasErradas} erros planejados de ${totalQuestoes} (regra ${porcAprovacao * 100}%)`);
      }

      // Determinístico: exatamente N primeiras questões erradas; demais corretas.
      const deveErrar = respostasErradasRealizadas < numRespostasErradas;

      return this.buscarQuestaoAtualExameFinal(indice).then((questao) => {
        const responder = deveErrar
          ? this.responderQuestaoIncorretamenteExameFinal(indice, questao)
          : this.responderQuestaoCorretamenteExameFinal(indice, questao);

        return responder.then(() => {
          if (deveErrar) {
            respostasErradasRealizadas += 1;
          }
        });
      });
    });
  }
}

export default new ExamesFinalPage();