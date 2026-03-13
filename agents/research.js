const { callClaude } = require("../anthropic");
const { parseJsonResponse } = require("../utils/parseJsonResponse");

async function runResearch(input, plannerOutput) {
  const system = `
ROLE: Senior SEO research strategist.

TASK:
Generate compact research insights for the article.

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

  return parseJsonResponse(response, "Research JSON");
}

module.exports = { runResearch };
