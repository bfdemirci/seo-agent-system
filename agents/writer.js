const { callClaude } = require("../anthropic");

async function runWriter(input, briefOutput) {

  const system = `
You are an expert Turkish SEO content writer.

Write a high-quality SEO article in Turkish.

WRITING RULES

- Minimum word count must match requested length.
- Write natural, professional Turkish.
- Use clear H2 and H3 headings.
- Provide deep explanations.

MANDATORY STRUCTURE

1. Introduction
2. Multiple H2 sections
3. Detailed explanations
4. H2: Sonuç (Conclusion)
5. H2: Sıkça Sorulan Sorular
6. H2: İç Link Önerileri

IMPORTANT

The article MUST always end with:

H2: Sonuç  
2-3 paragraphs summarizing the topic.

Do not end the article abruptly.
Ensure the conclusion is complete.

OUTPUT FORMAT

TITLE:
<title>

ARTICLE_MARKDOWN:
<full markdown article>
`;

  const user = `
Keyword: ${input.keyword}
Word count target: ${input.wordCount}
Tone: ${input.tone}

Sections to cover:
${(briefOutput.recommended_sections || []).join("\n")}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 4500
  });

  const text = response.trim();

  const titleMatch = text.match(/TITLE:\s*(.*)/i);
  const articleMatch = text.match(/ARTICLE_MARKDOWN:\s*([\s\S]*)/i);

  if (!titleMatch || !articleMatch) {
    console.log(text);
    throw new Error("Writer output parse hatası");
  }

  return {
    title: titleMatch[1].trim(),
    article_markdown: articleMatch[1].trim()
  };
}

module.exports = { runWriter };
