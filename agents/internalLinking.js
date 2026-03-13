const { callClaude } = require("../anthropic");

async function runInternalLinking(input, editorOutput, seoOutput) {
  const system = `
ROLE: You are the Internal Linking Agent.

OBJECTIVE:
Suggest internal linking opportunities for the article.

RULES:
- Return ONLY JSON.
- Do not invent existing URLs.
- Suggest target topics, anchor texts, and reasons.
- Keep suggestions SEO-relevant.

OUTPUT:
{
  "suggested_internal_links": [
    {
      "target_topic": "",
      "anchor_text": "",
      "reason": ""
    }
  ]
}
`;

  const user = `
Topic: ${input.topic}
Keyword: ${input.keyword}

Edited article:
${editorOutput.revised_article_markdown}

SEO output:
${JSON.stringify(seoOutput, null, 2)}
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
    console.log("Internal Linking JSON parse hatası:");
    console.log(clean);
    throw err;
  }
}

module.exports = { runInternalLinking };
