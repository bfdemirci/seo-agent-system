const { callClaude } = require("../anthropic");

async function runWriter(input, briefOutput) {
  const targetWordCount = Number(input.word_count) || 1200;
  const minimumWordCount = Math.max(1100, Math.floor(targetWordCount * 0.92));

  const sections = Array.isArray(briefOutput?.recommended_sections)
    ? briefOutput.recommended_sections
    : [];

  const questions = Array.isArray(briefOutput?.questions)
    ? briefOutput.questions
    : [];

  const primaryIntent = briefOutput?.primary_intent || "";

  const system = `
You are a professional Turkish SEO content writer.

Write a high quality article in Turkish Markdown.

LANGUAGE RULES
- Write ONLY in Turkish.
- Do not use English, Chinese, or any other language in the article.
- If a technical term is commonly used in English, explain it in Turkish.
- Do not mix languages in headings or paragraphs.

WRITING STYLE
- Write naturally, like a human editor.
- Avoid generic AI phrases.
- Avoid repetition.
- Use clear and strong sentences.

STRICT RULES
- The article MUST reach the minimum word count.
- Do not finish early.
- If the article is too short, continue by adding new relevant sections.
- Expand sections with examples, explanations, comparisons and practical detail.

STRUCTURE
- Use Markdown headings.
- Use one H1 title.
- Use at least 5 H2 headings.
- Use H3 headings where useful.

INTRODUCTION
The introduction must:
- define the topic
- explain why it matters
- explain what the reader will learn

CONTENT DEPTH
- Avoid shallow sections.
- Add examples when useful.
- Add comparisons when relevant.
- Add explanation instead of filler text.

SERP STRUCTURE
- If sections are missing, add logical sections users expect.

WORD COUNT ENFORCEMENT
- If the article is still below the minimum word count, add additional relevant sections and continue writing until the minimum is reached.

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
    maxTokens: 4200
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
