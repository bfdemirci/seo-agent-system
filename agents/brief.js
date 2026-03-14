const { callClaude } = require("../anthropic");
const { safeJson } = require("../utils/safeJson");

async function runBrief(input, plannerOutput, researchOutput, serpOutput = {}) {
  const system = `
You are a senior SEO content strategist.

Return ONLY valid JSON.

{
  "title_options": [],
  "primary_intent": "",
  "recommended_sections": [],
  "questions": []
}
`;

  const user = `
Keyword: ${input.keyword}
Topic: ${input.topic}
Language: ${input.language}
Tone: ${input.tone || "informative"}

Planner:
${JSON.stringify(plannerOutput || {}, null, 2)}

Research:
${JSON.stringify(researchOutput || {}, null, 2)}

SERP:
${JSON.stringify(serpOutput || {}, null, 2)}

Instructions:
- Use SERP insights to build a stronger article structure.
- recommended_sections should reflect likely top-ranking structure.
- Include missing topics if they seem important.
- questions should reflect likely user questions and PAA-style needs.
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 900
  });

  return safeJson(
    response,
    {
      title_options: [],
      primary_intent: "",
      recommended_sections: [],
      questions: []
    },
    "Brief JSON"
  );
}

module.exports = { runBrief };
