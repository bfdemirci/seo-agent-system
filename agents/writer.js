const { callClaude } = require("../anthropic");

async function runWriter(input, briefOutput) {
  const targetWordCount = Number(input.word_count) || 1200;
  const minimumWordCount = Math.max(800, Math.floor(targetWordCount * 0.85));

  const system = `
You are a professional Turkish SEO content writer.

Write a high-quality article in Turkish Markdown.

STRICT RULES:
- The article MUST be at least the minimum word count requested.
- Do not stop early.
- Expand sections with useful detail, examples, comparisons, and explanations.
- Do not use filler.
- Write naturally and clearly.
- Use one H1 title.
- Use at least 4 H2 headings.
- Use at least 2 H3 headings.
- H3 headings must be meaningful.
- Answer the likely search intent fully.
- Include a short FAQ section near the end when useful.

OUTPUT FORMAT EXACTLY:

TITLE: <title>

WORD_COUNT: <number>

ARTICLE_MARKDOWN:
<full markdown article>
`;

  const user = `
Keyword: ${input.keyword}
Topic: ${input.topic}
Language: ${input.language}
Tone: ${input.tone || "informative"}

Target word count: ${targetWordCount}
Minimum acceptable word count: ${minimumWordCount}

Recommended sections:
${JSON.stringify(briefOutput.recommended_sections || [])}

Questions to answer:
${JSON.stringify(briefOutput.questions || [])}

Primary intent:
${briefOutput.primary_intent || ""}

Instructions:
- Make the article substantial enough to meet the minimum acceptable word count.
- If the topic is broad, add useful subsections.
- If the topic is informational, explain key concepts clearly.
- Prefer depth over fluff.
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 2600
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

  const article = articleMatch[1].trim();
  const detectedWordCount =
    wordCountMatch?.[1] ? Number(wordCountMatch[1]) : article.split(/\s+/).filter(Boolean).length;

  return {
    title: titleMatch[1].trim(),
    article_markdown: article,
    word_count: detectedWordCount
  };
}

module.exports = { runWriter };
