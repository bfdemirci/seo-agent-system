const { callClaude } = require("../anthropic");

async function runWriter(input, briefOutput) {
  const system = `
ROLE: Senior Turkish SEO content writer.

GOAL:
Write a high-quality, natural-sounding, useful article that fully answers the search query.

WRITING STYLE:
- Write in natural Turkish.
- Write like a skilled human editor, not a chatbot.
- Avoid robotic phrasing.
- Avoid filler.
- Avoid repeating sentence patterns.
- Prefer clear paragraphs over excessive bullet lists.
- Use headings that match search intent.

QUALITY RULES:
- The introduction must directly answer the keyword.
- Each section should be useful and specific.
- Do not stay generic.
- Add practical explanations where relevant.
- Keep the article engaging and readable.
- Avoid cliches such as:
  "kapsamlı rehber"
  "gelin birlikte inceleyelim"
  "dijital dünyada"
  "önemli bir yere sahiptir"

SEO RULES:
- Use the primary keyword naturally.
- Cover the main user intent completely.
- Use brief guidance for section coverage.
- Make the article better than generic first-page content.

OUTPUT FORMAT:
TITLE: <title>
WORD_COUNT: <number>
ARTICLE_MARKDOWN:
<full article in markdown>
`;

  const user = `
INPUT:
${JSON.stringify(input, null, 2)}

BRIEF:
${JSON.stringify(briefOutput, null, 2)}

INSTRUCTIONS:
- Follow the brief closely.
- Respect tone if provided.
- Respect word count target if provided.
- If an outline exists in the input, follow it.
- Write a complete article, not notes.
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 2200
  });

  const text = response.trim();

  const titleMatch = text.match(/TITLE:\s*(.+)/i);
  const wordCountMatch = text.match(/WORD_COUNT:\s*(\d+)/i);
  const articleMatch = text.match(/ARTICLE_MARKDOWN:\s*([\s\S]*)/i);

  if (!titleMatch || !articleMatch) {
    console.log("Writer parse hatası:");
    console.log(text);
    throw new Error("Writer output format geçersiz");
  }

  return {
    title: titleMatch[1].trim(),
    article_markdown: articleMatch[1].trim(),
    word_count: wordCountMatch ? Number(wordCountMatch[1]) : 0
  };
}

module.exports = { runWriter };
