const { callClaude } = require("../anthropic");

async function runResearch(input, plannerOutput) {
  const system = `
ROLE: You are the Research Agent.

OBJECTIVE:
Provide compact research insights for the article.

RULES:
- Return ONLY JSON.
- Keep every list short and practical.
- Do not exceed 8 items per list.
- Keep each item concise.
- No markdown fences.

OUTPUT:
{
  "competitor_angles": [],
  "important_entities": [],
  "questions_people_ask": [],
  "content_gaps": []
}
`;

  const user = `
Topic: ${input.topic}
Keyword: ${input.keyword}
Language: ${input.language}
Country: ${input.country}

Planner output:
${JSON.stringify(plannerOutput, null, 2)}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 700
  });

  const clean = response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(clean);
  } catch (err) {
    console.log("Research JSON parse hatası:");
    console.log(clean);
    throw err;
  }
}

module.exports = { runResearch };
