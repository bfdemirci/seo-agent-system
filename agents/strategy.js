const { callClaude } = require("../anthropic");
const { safeJson } = require("../utils/safeJson");

async function runStrategy(input, plannerOutput = {}) {
  const system = `
You are a senior SEO content strategist.

Return ONLY valid JSON.

{
  "primary_intent": "",
  "target_audience": "",
  "recommended_title_direction": "",
  "recommended_sections": [],
  "questions": [],
  "must_cover_topics": [],
  "content_gaps": [],
  "style_notes": [],
  "recommended_word_range": ""
}
`;

  const user = `
Keyword: ${input.keyword}
Topic: ${input.topic}
Language: ${input.language}
Country: ${input.country}
Tone: ${input.tone || "informative"}

Planner output:
${JSON.stringify(plannerOutput || {}, null, 2)}

Instructions:
- Infer likely Google search intent.
- Infer what page-one results would usually contain.
- Build a practical article structure.
- Identify must-cover topics.
- Include likely user questions.
- Keep outputs concise and usable.
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 1400
  });

  return safeJson(
    response,
    {
      primary_intent: "",
      target_audience: "",
      recommended_title_direction: "",
      recommended_sections: [],
      questions: [],
      must_cover_topics: [],
      content_gaps: [],
      style_notes: [],
      recommended_word_range: ""
    },
    "Strategy JSON"
  );
}

module.exports = { runStrategy };
