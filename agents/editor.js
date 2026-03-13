const { callClaude } = require("../anthropic");

async function runEditor(writerOutput) {
  const system = `
You are a professional Turkish editor.

Your task is to improve a Turkish SEO article written by an AI.

EDITOR RULES
- Keep the article fully in Turkish.
- Remove awkward AI-like phrasing.
- Replace unnatural words with natural Turkish alternatives.
- Improve flow and readability.
- Keep the meaning intact.
- Do not shorten the article significantly.
- Preserve Markdown headings.
- Strengthen the conclusion so it feels more useful and confident.
- Do not add fake facts.
- Do not add markdown fences.

OUTPUT FORMAT

REVISED_ARTICLE_MARKDOWN:
<full revised markdown article>
`;

  const user = `
Current article title:
${writerOutput.title}

Current article:
${writerOutput.article_markdown}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 4200
  });

  const text = response.trim();
  const articleMatch = text.match(/REVISED_ARTICLE_MARKDOWN:\s*([\s\S]*)/i);

  if (!articleMatch) {
    console.log("Editor parse hatası:");
    console.log(text);
    throw new Error("Editor output format geçersiz");
  }

  return {
    revised_article_markdown: articleMatch[1].trim()
  };
}

module.exports = { runEditor };
