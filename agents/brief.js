const { callClaude } = require("../anthropic");
const { safeJson } = require("../utils/safeJson");

async function runBrief(input, plannerOutput, researchOutput, serpOutput, contentGapOutput) {
  const system = `
Return ONLY JSON.

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
  "semantic_terms_to_include": [],
  "entity_coverage_notes": [],
  "cta_direction": ""
}
`;

  const user = `
Topic: ${input.topic || ""}
Keyword: ${input.keyword || ""}
Language: ${input.language || ""}
Country: ${input.country || ""}
Tone: ${input.tone || "informative"}
Word count target: ${input.word_count || 1200}

Planner output:
${JSON.stringify(plannerOutput || {}, null, 2)}

Research output:
${JSON.stringify(researchOutput || {}, null, 2)}

SERP output:
${JSON.stringify(serpOutput || {}, null, 2)}

Content gap output:
${JSON.stringify(contentGapOutput || {}, null, 2)}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 1200
  });

  return safeJson(response, {
    article_goal: "",
    search_intent: "",
    target_audience: "",
    primary_angle: "",
    recommended_title_direction: "",
    recommended_intro_direction: "",
    must_cover_points: [],
    recommended_sections: [],
    questions_to_answer: [],
    seo_notes: [],
    semantic_terms_to_include: [],
    entity_coverage_notes: [],
    cta_direction: ""
  }, "Brief JSON");
}

module.exports = { runBrief };
