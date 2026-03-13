const { callClaude } = require("../anthropic");

async function runClaimExtractor(writerOutput) {
  const system = `
ROLE: You are the Claim Extractor Agent.

OBJECTIVE:
Extract factual or verifiable claims from the article.

RULES:
- Return ONLY JSON.
- Extract short, clear claims.
- Ignore opinions and generic transitions.

OUTPUT:
{
  "claims": []
}
`;

  const user = `
Article:
${writerOutput.article_markdown}
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

module.exports = { runClaimExtractor };
