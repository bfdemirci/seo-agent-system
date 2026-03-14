const { callClaude } = require("../anthropic");

function getTail(text, maxChars = 5000) {
  const str = String(text || "");
  return str.length > maxChars ? str.slice(-maxChars) : str;
}

async function runFinalizer(editorOutput) {
  const fullArticle = String(editorOutput.revised_article_markdown || "");
  const tail = getTail(fullArticle, 5000);

  const system = `
You are a professional Turkish editor.

Your task is to repair ONLY the ending of a Turkish SEO article.

RULES
- Do not rewrite the whole article.
- Only complete the unfinished ending if needed.
- Keep everything in Turkish.
- If the article already ends naturally, return it unchanged.
- If the ending is cut off, complete the last unfinished section.
- Add a short strong conclusion only if necessary.
- Do not add markdown fences.

OUTPUT FORMAT

FINAL_ENDING:
<only the corrected ending text>
`;

  const user = `
Below is the ending part of an article:

${tail}

Important:
- Return only the corrected ending section.
- Do not repeat the full article.
- If the ending is already complete, return it as is.
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 1200
  });

  const text = response.trim();
  const match = text.match(/FINAL_ENDING:\s*([\s\S]*)/i);

  if (!match) {
    console.log("Finalizer parse hatası:");
    console.log(text);
    throw new Error("Finalizer output format geçersiz");
  }

  const fixedEnding = match[1].trim();

  if (!fixedEnding) {
    return {
      final_article_markdown: fullArticle
    };
  }

  const prefix = fullArticle.slice(0, Math.max(0, fullArticle.length - tail.length));

  return {
    final_article_markdown: prefix + fixedEnding
  };
}

module.exports = { runFinalizer };
