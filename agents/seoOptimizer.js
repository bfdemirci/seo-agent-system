const { callClaude } = require("../anthropic");
const { safeJson } = require("../utils/safeJson");

async function runSeoOptimizer(input, editorOutput) {
  const system = `
Return ONLY JSON.

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
${JSON.stringify(input || {}, null, 2)}

EDITOR OUTPUT:
${JSON.stringify(editorOutput || {}, null, 2)}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 1000
  });

  return safeJson(response, {
    seo_title: "",
    meta_description: "",
    slug: "",
    faq_questions: [],
    internal_link_suggestions: [],
    schema_type: "Article"
  }, "SEO Optimizer JSON");
}

module.exports = { runSeoOptimizer };
