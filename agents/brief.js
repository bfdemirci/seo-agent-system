const { callClaude } = require("../anthropic");
const { parseJsonResponse } = require("../utils/parseJsonResponse");

async function runBrief(input, plannerOutput, researchOutput, serpOutput) {
  const system = `
ROLE: Senior SEO content brief strategist.

GOAL:
Create a high-quality article brief that a writer can directly use to produce a strong SEO article.

IMPORTANT:
- Return ONLY valid JSON.
- No markdown fences.
- Keep output practical and directly usable.
- Focus on article structure, angle, priorities, coverage, and SEO usefulness.

RULES:
- Do not write the article.
- Do not produce fluff.
- Build a brief that improves article quality and search intent match.
- Use the planner, research, and SERP outputs together.
- Prioritize practical article guidance over theory.
- Keep lists concise but useful.

OUTPUT:
{
  "article_goal": "",
  "search_intent": "",
  "target_audience": "",
  "primary_angle": "",
  "recommended_title_direction": "",
  "recommended_intro_direction": "",
  "must_cover_points": [],
  "recommended_sections": [],
  "questions_to_answer": [],
  "seo_notes": [],
  "cta_direction": ""
}
`;

  const user = `
Topic: ${input.topic}
Keyword: ${input.keyword}
Language: ${input.language}
Country: ${input.country}
Tone: ${input.tone || "informative"}
Word count target: ${input.word_count || 1200}

Planner output:
${JSON.stringify(plannerOutput, null, 2)}

Research output:
${JSON.stringify(researchOutput, null, 2)}

SERP output:
${JSON.stringify(serpOutput, null, 2)}

Additional guidance:
- Make the brief useful for writing a better article than generic competitors.
- Use likely user questions and section priorities.
- Keep the article focused, helpful, and structured.
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 1200
  });

  return parseJsonResponse(response, "Brief JSON");
}

module.exports = { runBrief };
