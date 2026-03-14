const { callClaude } = require("../anthropic");
const { safeJson } = require("../utils/safeJson");

async function runSeoOptimizer(input, article) {
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

  const body =
    article?.revised_article_markdown ||
    article?.article_markdown ||
    "";

  const user = `
Keyword: ${input.keyword}
Topic: ${input.topic}
Language: ${input.language}

Article:
${body}

GUIDANCE:
- SEO title should be clickable and natural
- Meta description 140-160 characters
- Slug short and clean
- Generate 5-7 FAQ questions
- Generate 5-7 internal link suggestions
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 900
  });

  return safeJson(
    response,
    {
      seo_title: "",
      meta_description: "",
      slug: "",
      faq_questions: [],
      internal_link_suggestions: [],
      schema_type: "Article"
    },
    "SEO JSON"
  );
}

module.exports = { runSeoOptimizer };
