import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decideStageGate,
  infraBlocked,
  isAuthorized,
  precheckFlagsForStage,
  processExitFromCounts,
  requiresForStage,
  suiteFunctionalStatus,
} from "../scripts/suite-gates.mjs";

describe("isAuthorized", () => {
  it("nega auth sem flag", () => {
    assert.equal(isAuthorized({ auth: false }, ["auth"]), false);
  });
  it("nega mutating sem flag", () => {
    assert.equal(isAuthorized({ mutating: false }, ["mutating"]), false);
  });
  it("exige ambos para fases/final", () => {
    assert.equal(
      isAuthorized({ auth: true, mutating: false }, ["auth", "mutating"]),
      false
    );
    assert.equal(
      isAuthorized({ auth: true, mutating: true }, ["auth", "mutating"]),
      true
    );
  });
});

describe("infraBlocked", () => {
  it("bloqueia após FAIL de smoke", () => {
    assert.equal(
      infraBlocked([
        { id: "static", status: "PASS" },
        { id: "unit", status: "PASS" },
        { id: "smoke", status: "FAIL" },
      ]),
      true
    );
  });
  it("não bloqueia quando infra passou", () => {
    assert.equal(
      infraBlocked([
        { id: "static", status: "PASS" },
        { id: "unit", status: "PASS" },
        { id: "smoke", status: "PASS" },
      ]),
      false
    );
  });
});

describe("decideStageGate", () => {
  it("BLOQUEIA login se smoke falhou", () => {
    const d = decideStageGate({
      stageId: "login",
      requires: ["auth"],
      flags: { auth: true, mutating: true },
      completedStages: [{ id: "smoke", status: "FAIL" }],
      precheckOk: true,
      massConfirmed: true,
      envReady: true,
    });
    assert.equal(d.action, "BLOCK");
  });

  it("HOLD login sem AUTH flag", () => {
    const d = decideStageGate({
      stageId: "login",
      requires: ["auth"],
      flags: { auth: false },
      completedStages: [
        { id: "static", status: "PASS" },
        { id: "unit", status: "PASS" },
        { id: "smoke", status: "PASS" },
      ],
      precheckOk: true,
      envReady: true,
    });
    assert.equal(d.action, "HOLD");
  });

  it("HOLD cadastro sem emailJa / precheck", () => {
    const d = decideStageGate({
      stageId: "cadastro",
      requires: ["mutating"],
      flags: { mutating: true },
      completedStages: [
        { id: "static", status: "PASS" },
        { id: "smoke", status: "PASS" },
      ],
      precheckOk: false,
      envReady: false,
    });
    assert.equal(d.action, "HOLD");
  });

  it("HOLD fases sem MASS confirmada mesmo com flags", () => {
    const d = decideStageGate({
      stageId: "fases",
      requires: ["auth", "mutating"],
      flags: { auth: true, mutating: true },
      completedStages: [
        { id: "static", status: "PASS" },
        { id: "unit", status: "PASS" },
        { id: "smoke", status: "PASS" },
      ],
      precheckOk: true,
      massConfirmed: false,
      envReady: true,
    });
    assert.equal(d.action, "HOLD");
    assert.match(d.reason, /MASS/);
  });

  it("RUN final com flags + massa + precheck", () => {
    const d = decideStageGate({
      stageId: "final",
      requires: ["auth", "mutating"],
      flags: { auth: true, mutating: true },
      completedStages: [
        { id: "static", status: "PASS" },
        { id: "unit", status: "PASS" },
        { id: "smoke", status: "PASS" },
      ],
      precheckOk: true,
      massConfirmed: true,
      envReady: true,
    });
    assert.equal(d.action, "RUN");
  });

  it("nunca promove HOLD a PASS via suiteFunctionalStatus", () => {
    assert.equal(
      suiteFunctionalStatus({ PASS: 3, HOLD: 4, FAIL: 0 }),
      "HOLD"
    );
    assert.equal(
      suiteFunctionalStatus({ PASS: 3, BLOCK: 1, FAIL: 0 }),
      "HOLD"
    );
    assert.equal(
      suiteFunctionalStatus({ PASS: 2, FAIL: 1, HOLD: 0 }),
      "FAIL"
    );
    assert.equal(suiteFunctionalStatus({ PASS: 7 }), "PASS");
  });
});

describe("processExitFromCounts", () => {
  it("exit 1 com FAIL ou BLOCK", () => {
    assert.equal(processExitFromCounts({ FAIL: 1 }), 1);
    assert.equal(processExitFromCounts({ BLOCK: 1 }), 1);
    assert.equal(processExitFromCounts({ HOLD: 4, PASS: 3 }), 0);
  });
});

describe("precheckFlagsForStage", () => {
  it("cadastro exige emailJaCadastrado e emailDomain", () => {
    const flags = precheckFlagsForStage("cadastro");
    assert.ok(flags.includes("--require-email-ja-cadastrado"));
    assert.ok(flags.includes("--require-email-domain"));
    assert.ok(flags.includes("--reject-placeholders"));
  });
  it("login e final não exigem emailDomain", () => {
    assert.equal(
      precheckFlagsForStage("login").includes("--require-email-domain"),
      false
    );
    assert.equal(
      precheckFlagsForStage("final").includes("--require-email-domain"),
      false
    );
  });
  it("final exige profiles", () => {
    assert.ok(
      precheckFlagsForStage("final").includes("--require-profiles")
    );
  });
  it("requiresForStage cobre mutáveis", () => {
    assert.deepEqual(requiresForStage("cadastro"), ["mutating"]);
    assert.deepEqual(requiresForStage("fases"), ["auth", "mutating"]);
  });
});
