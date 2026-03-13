const { callClaude } = require("../anthropic");

async function runSeoOptimizer(input, editorOutput) {
  const system = `
ROLE: You are the SEO Optimizer Agent.

OBJECTIVE:
Create the final SEO package for the revised article.

RULES:
- Return ONLY JSON.
- Keep outputs practical and publish-ready.
- Do NOT invent facts.
- Focus on on-page SEO.

OUTPUT:
{
  "seo_title": "",
  "meta_description": "",
  "slug": "",
  "faq_questions": [],
  "internal_link_suggestions": [],
  "schema_type": ""
}
`;

  const user = `
Topic: ${input.topic}
Primary keyword: ${input.keyword}
Language: ${input.language}
Country: ${input.country}

Revised article:
${editorOutput.revised_article_markdown}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 2000
  });

  const clean = response
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(clean);
}

module.exports = { runSeoOptimizer };
