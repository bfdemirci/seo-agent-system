const { callClaude } = require("../anthropic");

async function runSerpAnalyzer(input, plannerOutput, researchOutput) {
  const system = `
ROLE: Senior SEO SERP strategist.

GOAL:
Analyze the keyword like a search results strategist and produce a practical SEO structure signal set for the article.

IMPORTANT:
- Return ONLY valid JSON.
- No markdown fences.
- Keep outputs concise but useful.
- Think like you are analyzing the first page of Google.
- Focus on what should be included in the article to outperform generic content.

RULES:
- Do not invent fake statistics.
- Do not produce fluffy output.
- Prioritize user intent, topic coverage, content gaps, and section priorities.
- Keep each list practical.
- Maximum 8 items per list.

OUTPUT:
{
  "search_intent": "",
  "primary_angle": "",
  "paa_topics": [],
  "must_have_sections": [],
  "section_priorities": [],
  "content_gaps_to_cover": [],
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

Additional guidance:
- Infer likely Google search intent.
- Suggest what sections must exist in the article.
- Identify likely People Also Ask style subtopics.
- Identify missing angles generic competitors usually miss.
- Prioritize sections from most important to least important.
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 1200
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
