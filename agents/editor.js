const { callClaude } = require("../anthropic");

async function runEditor(writerOutput, factCheckerOutput) {
  const system = `
ROLE: You are the Editor Agent.

OBJECTIVE:
Revise the article using the fact checker output.

RULES:
- Return ONLY the revised article in markdown.
- Do NOT return JSON.
- Keep the same structure as much as possible.
- Remove or soften claims marked as "uncertain" or "needs_source".
- Do NOT invent new facts.
- Preserve readability.
`;

  const user = `
Original article:
${writerOutput.article_markdown}

Fact checker output:
${JSON.stringify(factCheckerOutput, null, 2)}
`;

  const revised = await callClaude({
    system,
    user,
    maxTokens: 1800
  });

  return {
    revised_article_markdown: revised.trim(),
    changes_summary: ["Uncertain or unsupported claims were softened or removed."]
  };
}

module.exports = { runEditor };
