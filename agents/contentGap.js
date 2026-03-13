const { callClaude } = require("../anthropic");
const { parseJsonResponse } = require("../utils/parseJsonResponse");

async function runContentGap(input, plannerOutput, researchOutput, serpOutput) {
  const system = `
ROLE: Senior SEO semantic strategist.

GOAL:
Generate semantic coverage guidance for the article so it covers related concepts, entities, and missing subtopics.

IMPORTANT:
- Return ONLY valid JSON.
- No markdown fences.
- Be concise, practical, and SEO-focused.
- Focus on semantic completeness, not fluff.

RULES:
- Do not invent fake facts or statistics.
- Keep each item short.
- Maximum 12 items per list.

OUTPUT:
{
  "semantic_keywords": [],
  "related_entities": [],
  "secondary_topics": [],
  "missing_subtopics": [],
  "term_usage_notes": []
}
`;

  const user = `
Topic: ${input.topic || ""}
Keyword: ${input.keyword || ""}
Language: ${input.language || ""}
Country: ${input.country || ""}

Planner output:
${JSON.stringify(plannerOutput, null, 2)}

Research output:
${JSON.stringify(researchOutput, null, 2)}

SERP output:
${JSON.stringify(serpOutput, null, 2)}

Additional guidance:
- Identify related phrases the article should naturally include.
- Identify entities, institutions, concepts, or product types relevant to the query.
- Identify missing subtopics generic competitors often skip.
- Focus on search intent and topical completeness.
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 1000
  });

  return parseJsonResponse(response, "Content Gap JSON");
}

module.exports = { runContentGap };
