const { callClaude } = require("../anthropic");

async function runPlanner(input) {
  const system = `
ROLE: You are the Planner Agent.

OBJECTIVE:
Analyze the topic and define the SEO content strategy.
Do NOT write the article.

RULES:
Return ONLY JSON.

OUTPUT:
{
 "search_intent": "",
 "article_angle": "",
 "reader_pain_points": [],
 "recommended_sections": []
}
`;

  const user = `
Topic: ${input.topic}
Primary keyword: ${input.keyword}
Language: ${input.language}
Country: ${input.country}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 800
  });

  const clean = response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(clean);
}

module.exports = { runPlanner };
