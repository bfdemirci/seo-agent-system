const { callClaude } = require("../anthropic");

async function runFinalizer(editorOutput) {
  const system = `
You are a professional Turkish editor.

Your task is to finalize and complete a Turkish SEO article.

RULES
- Keep everything in Turkish.
- If the article is cut off or unfinished, complete it.
- Focus especially on the ending and conclusion.
- Do not rewrite the whole article from scratch.
- Preserve existing headings and structure.
- If the last section is incomplete, finish that section.
- Then add a strong conclusion if needed.
- Make sure the article ends naturally and cleanly.
- Do not add markdown fences.

OUTPUT FORMAT

FINAL_ARTICLE_MARKDOWN:
<full finalized markdown article>
`;

  const user = `
Current article:

${editorOutput.revised_article_markdown}

Important:
- Check whether the ending is incomplete.
- If the article ends abruptly, fix it.
- Ensure the last section and final conclusion are complete.
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 2500
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
