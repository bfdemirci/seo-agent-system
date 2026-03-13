const { callClaude } = require("../anthropic");

async function runWriter(input, briefOutput) {

  const system = `
You are a professional SEO content writer.

Write a high-quality SEO article in Markdown.

Rules:
- Use H2 and H3 headings
- Write naturally for humans
- Avoid keyword stuffing
- Be informative and structured
- Aim for the requested word count

Output format EXACTLY like this:

TITLE: <title>

ARTICLE_MARKDOWN:
<markdown article>
`;

  const user = `
Keyword: ${input.keyword}
Topic: ${input.topic}
Language: ${input.language}

Sections to cover:
${JSON.stringify(briefOutput.recommended_sections)}

Questions to answer:
${JSON.stringify(briefOutput.questions)}

Target word count:
${input.word_count}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 2000
  });

  const text = response.trim();

  const titleMatch = text.match(/TITLE:\s*(.+)/i);
  const articleMatch = text.match(/ARTICLE_MARKDOWN:\s*([\s\S]*)/i);

  if (!titleMatch || !articleMatch) {
    console.log("Writer parse hatası:");
    console.log(text);
    throw new Error("Writer output format geçersiz");
  }

  return {
    title: titleMatch[1].trim(),
    article_markdown: articleMatch[1].trim()
  };
}

module.exports = { runWriter };
