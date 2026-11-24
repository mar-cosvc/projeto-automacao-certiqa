import fs from "node:fs";
import path from "node:path";

const featureDir = "cypress/e2e/features";
const stepsDir = "cypress/e2e/step_definitions";
const injectMissing = process.argv.includes("--inject-missing");
const injectDuplicate = process.argv.includes("--inject-duplicate");

const defs = new Map();
const duplicates = [];

for (const f of fs.readdirSync(stepsDir).filter((x) => x.endsWith(".js"))) {
  let src = fs.readFileSync(path.join(stepsDir, f), "utf8");
  if (injectDuplicate && f === "login.steps.js") {
    src += `\nGiven("acesso a página de login", () => {});`;
  }
  const re = /(Given|When|Then|And)\(\s*["'`](.*?)["'`]/gs;
  let m;
  while ((m = re.exec(src))) {
    const text = m[2];
    if (defs.has(text)) duplicates.push({ text, a: defs.get(text), b: f });
    else defs.set(text, f);
  }
}

if (injectMissing) {
  // Remove one known definition from the matching set to prove detection.
  defs.delete("o formulário de login deve ser exibido");
}

const featureSteps = [];
for (const f of fs.readdirSync(featureDir).filter((x) => x.endsWith(".feature"))) {
  for (const line of fs.readFileSync(path.join(featureDir, f), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (/^(Dado|Quando|Então|Entao|E|Mas)\b/i.test(t) && !t.startsWith("#")) {
      featureSteps.push({
        file: f,
        text: t.replace(/^(Dado|Quando|Então|Entao|E|Mas)\s+/i, ""),
      });
    }
  }
}

function matches(pattern, candidate) {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regexSrc =
    "^" +
    escaped
      .replace(/\\\{string\\\}/g, '"[^"]*"')
      .replace(/\\\{int\\\}/g, "\\d+")
      .replace(/\\\{float\\\}/g, "\\d+(?:\\.\\d+)?") +
    "$";
  try {
    return new RegExp(regexSrc).test(candidate);
  } catch {
    return false;
  }
}

const unmatched = [];
for (const step of featureSteps) {
  let ok = false;
  for (const pattern of defs.keys()) {
    if (matches(pattern, step.text)) {
      ok = true;
      break;
    }
  }
  if (!ok) unmatched.push(step);
}

const uniqueUnmatched = [
  ...new Map(unmatched.map((u) => [`${u.file}::${u.text}`, u])).values(),
];

console.log(
  JSON.stringify(
    {
      stepDefs: defs.size,
      featureSteps: featureSteps.length,
      duplicates,
      unmatchedUnique: uniqueUnmatched,
      mode: {
        injectMissing,
        injectDuplicate,
      },
    },
    null,
    2
  )
);

if (!injectMissing && !injectDuplicate) {
  if (duplicates.length || uniqueUnmatched.length) process.exit(1);
}
