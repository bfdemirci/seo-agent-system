const { callClaude } = require("../anthropic");

async function runSerpAnalyzer(input, plannerOutput, researchOutput) {
  const system = `
ROLE: You are the SERP Analyzer Agent.

OBJECTIVE:
Analyze what kind of content is likely to perform best for the target keyword.

RULES:
- Return ONLY JSON.
- Do not invent live SERP data.
- Infer patterns from planner and research outputs.
- Keep recommendations practical.

OUTPUT:
{
  "dominant_intent": "",
  "top_result_patterns": [],
  "common_headings": [],
  "serp_features": [],
  "recommended_angle_adjustments": []
}
`;

  const user = `
Topic: ${input.topic}
Keyword: ${input.keyword}
Language: ${input.language}
Country: ${input.country}

Planner output:
${JSON.stringify(plannerOutput, null, 2)}

Research output:
${JSON.stringify(researchOutput, null, 2)}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 1500
  });

  const clean = response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(clean);
  } catch (err) {
    console.log("SERP Analyzer JSON parse hatası:");
    console.log(clean);
    throw err;
  }
}

module.exports = { runSerpAnalyzer };
