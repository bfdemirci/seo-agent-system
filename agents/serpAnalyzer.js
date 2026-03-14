const { callClaude } = require("../anthropic");
const { safeJson } = require("../utils/safeJson");

async function runSerpAnalyzer(input, plannerOutput, researchOutput) {
  const system = `
You are an expert SEO SERP strategist.

Your task is to infer what top-ranking Google results likely contain for a keyword.

Return ONLY valid JSON.

{
  "search_intent": "",
  "average_word_count_range": "",
  "common_headings": [],
  "must_cover_topics": [],
  "content_gaps": [],
  "recommended_outline": []
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

Research output:
${JSON.stringify(researchOutput || {}, null, 2)}

Instructions:
- Infer what users expect to see on page one.
- Infer likely heading patterns.
- Infer missing opportunities generic competitors may skip.
- Keep outputs concise and useful.
- recommended_outline should be a practical SEO article structure.
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 1200
  });

  return safeJson(
    response,
    {
      search_intent: "",
      average_word_count_range: "",
      common_headings: [],
      must_cover_topics: [],
      content_gaps: [],
      recommended_outline: []
    },
    "SERP Analyzer JSON"
  );
}

module.exports = { runSerpAnalyzer };
