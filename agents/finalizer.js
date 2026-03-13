const { callClaude } = require("../anthropic");

async function runFinalizer(editorOutput) {
  const system = `
You are a professional Turkish content editor.

Your task is to finalize a Turkish SEO article.

FINALIZATION RULES

- Ensure the article is NOT cut off.
- If the article ends abruptly, complete the missing parts.
- Improve the final paragraphs so the article ends naturally.
- Ensure a strong conclusion.
- Do NOT significantly shorten the article.
- Keep headings intact.
- Keep the article fully in Turkish.
- Do NOT repeat the entire article unnecessarily.
- Only improve and finalize the existing content.

OUTPUT FORMAT

FINAL_ARTICLE_MARKDOWN:
<final revised markdown article>
`;

  const user = `
Current article:

${editorOutput.revised_article_markdown}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 4200
  });

  const text = response.trim();
  const articleMatch = text.match(/FINAL_ARTICLE_MARKDOWN:\s*([\s\S]*)/i);

  if (!articleMatch) {
    console.log("Finalizer parse hatası:");
    console.log(text);
    throw new Error("Finalizer output format geçersiz");
  }

  return {
    final_article_markdown: articleMatch[1].trim()
  };
}

module.exports = { runFinalizer };
