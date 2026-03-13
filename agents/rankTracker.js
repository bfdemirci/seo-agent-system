const { callClaude } = require("../anthropic");

async function runRankTracker(input, seoOutput, editorOutput) {
  const system = `
ROLE: You are the Rank Tracker Agent.

OBJECTIVE:
Define what should be tracked after the article is published.

RULES:
- Return ONLY JSON.
- Do not invent rankings.
- Focus on tracking plan, success metrics, and refresh triggers.

OUTPUT:
{
  "primary_keywords": [],
  "secondary_keywords": [],
  "tracking_frequency": "",
  "success_metrics": [],
  "refresh_triggers": []
}
`;

  const user = `
Topic: ${input.topic}
Keyword: ${input.keyword}
Language: ${input.language}
Country: ${input.country}

SEO output:
${JSON.stringify(seoOutput, null, 2)}

Edited article:
${editorOutput.revised_article_markdown}
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
    console.log("Rank Tracker JSON parse hatası:");
    console.log(clean);
    throw err;
  }
}

module.exports = { runRankTracker };
