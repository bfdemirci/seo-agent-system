const { callClaude } = require("../anthropic");

async function runTopicalMap(input, plannerOutput, researchOutput, seoOutput) {
  const system = `
ROLE: You are the Topical Map Agent.

OBJECTIVE:
Create a topical authority map around the main keyword.

RULES:
- Return ONLY JSON.
- Do not invent traffic numbers.
- Focus on logical content clusters.
- Keep it actionable.

OUTPUT:
{
  "pillar_topic": "",
  "cluster_articles": [],
  "supporting_articles": [],
  "publishing_priority": []
}
`;

  const user = `
Topic: ${input.topic}
Keyword: ${input.keyword}
Language: ${input.language}
Country: ${input.country}

Planner output:
${JSON.stringify(plannerOutput, null, 2)}

Research output:
${JSON.stringify(researchOutput, null, 2)}

SEO output:
${JSON.stringify(seoOutput, null, 2)}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 1500
  });

  const clean = response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(clean);
  } catch (err) {
    console.log("Topical Map JSON parse hatası:");
    console.log(clean);
    throw err;
  }
}

module.exports = { runTopicalMap };
