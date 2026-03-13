const { callClaude } = require("../anthropic");

async function runFactChecker(claimExtractorOutput) {
  const system = `
ROLE: You are the Fact Checker Agent.

OBJECTIVE:
Review the extracted claims and classify them by confidence.

RULES:
- Return ONLY JSON.
- Do NOT invent sources.
- For each claim, mark one of:
  - "likely_true"
  - "uncertain"
  - "needs_source"
- Keep explanations short.

OUTPUT:
{
  "checked_claims": [
    {
      "claim": "",
      "status": "",
      "note": ""
    }
  ]
}
`;

  const user = `
Claims:
${JSON.stringify(claimExtractorOutput, null, 2)}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 2000
  });

  const clean = response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(clean);
}

module.exports = { runFactChecker };
