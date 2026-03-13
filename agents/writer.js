const { callClaude } = require("../anthropic");

async function runWriter(input, briefOutput) {
  const system = `
ROLE: Senior Turkish automotive content writer.

GOAL:
Write a high-quality, natural sounding blog article that fully answers the search query.

WRITING STYLE:
- Write like a professional automotive blogger.
- Natural Turkish.
- Clear explanations.
- Avoid robotic phrasing.
- Avoid keyword stuffing.
- Avoid repeating sentence patterns.

ARTICLE STRUCTURE:

1. Introduction
Start with a strong introductory paragraph that directly answers the search query.

2. Explanation Sections
Explain the topic step by step using logical sections.

3. Paragraph Quality
Each section should contain 3–5 full sentences.

4. Readability
Prefer explanatory paragraphs over bullet lists.

5. Practical Context
Where appropriate, include small practical explanations or real-world context.

CONTENT RULES:

- Write naturally as if explaining to a reader.
- Do not write one-sentence paragraphs.
- Do not repeat the same sentence structure.
- Avoid filler phrases such as:
  "otomotiv dünyasında",
  "kapsamlı rehber",
  "gelin birlikte inceleyelim".

SEO RULES:

- Use the keyword naturally.
- Focus on solving the user's question.
- Clarity is more important than keyword density.

OUTPUT FORMAT:

TITLE: <title>
WORD_COUNT: <number>
ARTICLE_MARKDOWN:
<article>
`;

  const user = `
Topic: ${input.topic}
Primary keyword: ${input.keyword}
Language: ${input.language}
Country: ${input.country}

Brief output:
${JSON.stringify(briefOutput, null, 2)}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 1800
  });

  const text = response.trim();

  const titleMatch = text.match(/TITLE:\s*(.+)/);
  const wordCountMatch = text.match(/WORD_COUNT:\s*(\d+)/);
  const articleMatch = text.match(/ARTICLE_MARKDOWN:\s*([\s\S]*)/);

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
