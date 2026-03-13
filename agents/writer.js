const { callClaude } = require("../anthropic");

async function runWriter(input, briefOutput) {

  const targetWordCount = Number(input.word_count) || 1200;
  const minimumWordCount = Math.max(1000, Math.floor(targetWordCount * 0.9));

  const sections = Array.isArray(briefOutput?.recommended_sections)
    ? briefOutput.recommended_sections
    : [];

  const questions = Array.isArray(briefOutput?.questions)
    ? briefOutput.questions
    : [];

  const primaryIntent = briefOutput?.primary_intent || "";

  const system = `
You are a professional Turkish SEO content writer.

Write a high quality Turkish article that feels like it was written by a human expert.

WRITING STYLE

- Write naturally in Turkish
- Avoid AI sounding phrases
- Use clear and confident language

STRUCTURE

- Use Markdown headings
- One H1 title
- Multiple H2 sections
- Use H3 subsections where useful

INTRODUCTION

The introduction must:
- define the topic
- explain why it matters
- explain what the reader will learn

CONTENT DEPTH

- Avoid shallow sections
- Add examples when useful
- Add comparisons when relevant

ENTITY COVERAGE

When relevant include important:
- concepts
- technologies
- organizations
- people
- related topics

This helps create a richer and more authoritative article.

WORD COUNT RULE

If the article is shorter than requested,
expand sections with more explanation
until the minimum word count is reached.
If the article is still shorter than the minimum word count,
create additional relevant sections and continue writing
until the word count requirement is satisfied.

OUTPUT FORMAT

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

Primary intent:
${primaryIntent}

Recommended sections:
${JSON.stringify(sections, null, 2)}

Questions:
${JSON.stringify(questions, null, 2)}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 3500
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
    wordCountMatch?.[1]
      ? Number(wordCountMatch[1])
      : article.split(/\s+/).filter(Boolean).length;

  return {
    title: titleMatch[1].trim(),
    article_markdown: article,
    word_count: detectedWordCount
  };
}

module.exports = { runWriter };
