const { callClaude } = require("../anthropic");

async function runContentGap(input, researchOutput, serpAnalyzerOutput, briefOutput) {
  const system = `
ROLE: You are the Content Gap Agent.

OBJECTIVE:
Identify missing subtopics and opportunities that should be covered in the article.

RULES:
- Return ONLY JSON.
- Do not invent competitor facts.
- Use the given context only.
- Focus on practical content gaps.

OUTPUT:
{
  "missing_subtopics": [],
  "missing_questions": [],
  "competitor_advantages": [],
  "content_improvement_ideas": []
}
`;

  const user = `
Topic: ${input.topic}
Keyword: ${input.keyword}
Language: ${input.language}
Country: ${input.country}

Research output:
${JSON.stringify(researchOutput, null, 2)}

SERP analyzer output:
${JSON.stringify(serpAnalyzerOutput, null, 2)}

Brief output:
${JSON.stringify(briefOutput, null, 2)}
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
    console.log("Content Gap JSON parse hatası:");
    console.log(clean);
    throw err;
  }
}

module.exports = { runContentGap };
