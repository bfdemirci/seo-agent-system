const { callClaude } = require("../anthropic");
const { safeJson } = require("../utils/safeJson");

async function runContentGap(input, plannerOutput, researchOutput, serpOutput) {
  const system = `
Return ONLY JSON.

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
${JSON.stringify(plannerOutput || {}, null, 2)}

Research output:
${JSON.stringify(researchOutput || {}, null, 2)}

SERP output:
${JSON.stringify(serpOutput || {}, null, 2)}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 900
  });

  return safeJson(response, {
    semantic_keywords: [],
    related_entities: [],
    secondary_topics: [],
    missing_subtopics: [],
    term_usage_notes: []
  }, "Content Gap JSON");
}

module.exports = { runContentGap };
