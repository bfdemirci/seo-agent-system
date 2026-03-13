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

Write a high quality Turkish article in Markdown.

LANGUAGE RULES
- Write only in Turkish.
- Do not mix English or other languages into the article body.
- If a foreign term is necessary, explain it in Turkish.

WRITING STYLE
- Write naturally, clearly and confidently.
- Avoid generic AI phrases.
- Avoid repetition.
- Write like a human editor.

STRUCTURE
- Use Markdown headings.
- Use exactly one H1 title.
- Use at least 6 H2 headings.
- Use H3 headings where appropriate.
- The article must feel complete and structured.

INTRODUCTION
The introduction must:
- define the topic
- explain why it matters
- explain what the reader will learn

SECTION BLUEPRINT RULE
If the topic is broad or informational, the article should naturally include most of these section types when relevant:
- definition
- how it works
- main types or categories
- benefits
- drawbacks or limitations
- comparisons
- tools / methods / applications
- common mistakes
- future trends or what to expect
- conclusion

CONTENT DEPTH
- Avoid shallow sections.
- Add examples when helpful.
- Add comparisons when relevant.
- Add explanation instead of filler.

WORD COUNT RULE
- The article must reach the minimum word count.
- If it is too short, add new relevant sections from the blueprint above until the minimum is reached.

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

Important:
- Build a complete article structure.
- If the brief is short, expand with logical sections users expect.
- Make the article substantial enough to satisfy the minimum word count.
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
