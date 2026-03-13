const { callClaude } = require("../anthropic");
const { parseJsonResponse } = require("../utils/parseJsonResponse");

async function runSeoOptimizer(input, editorOutput) {
  const system = `
ROLE: Senior SEO optimizer.

GOAL:
Generate final SEO assets for the article.

IMPORTANT:
- Return ONLY valid JSON.
- No markdown fences.
- Keep all outputs practical and publishable.
- FAQ questions should reflect realistic People Also Ask style queries.
- Internal link suggestions should be specific and useful.
- Keep Turkish natural.

RULES:
- No fake claims.
- No generic weak FAQ.
- FAQ should target search intent, comparison intent, cost intent, process intent, and eligibility intent where relevant.
- Internal links should look like real article ideas.

OUTPUT:
{
  "seo_title": "",
  "meta_description": "",
  "slug": "",
  "faq_questions": [],
  "internal_link_suggestions": [],
  "schema_type": "Article"
}
`;

  const user = `
INPUT:
${JSON.stringify(input, null, 2)}

EDITOR OUTPUT:
${JSON.stringify(editorOutput, null, 2)}

GUIDANCE:
- SEO title should be clickable and natural.
- Meta description should be compelling and specific.
- Slug should be short and clean.
- Generate 6 to 8 strong FAQ questions.
- Generate 6 to 8 internal link suggestions.
- FAQ questions should resemble real Google PAA style questions.
- Internal links should support topical authority.
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 1200
  });

  return parseJsonResponse(response, "SEO Optimizer JSON");
}

module.exports = { runSeoOptimizer };
