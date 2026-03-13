const { callClaude } = require("../anthropic");

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function parseWriterResponse(text) {
  const titleMatch = text.match(/TITLE:\s*(.+)/i);
  const wordCountMatch = text.match(/WORD_COUNT:\s*(\d+)/i);
  const articleMatch = text.match(/ARTICLE_MARKDOWN:\s*([\s\S]*)/i);

  if (!titleMatch || !articleMatch) {
    console.log("Writer parse hatası:");
    console.log(text);
    throw new Error("Writer output format geçersiz");
  }

  const article = articleMatch[1].trim();

  return {
    title: titleMatch[1].trim(),
    article_markdown: article,
    word_count: wordCountMatch?.[1]
      ? Number(wordCountMatch[1])
      : countWords(article)
  };
}

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

  const baseSystem = `
You are a professional Turkish SEO content writer.

Write a high quality Turkish article in Markdown.

LANGUAGE RULES
- Write only in Turkish.
- Do not mix English or other languages into the article body.
- If a foreign term is necessary, explain it in Turkish.
- Avoid awkward translations and unnatural wording.

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

INTRODUCTION
The introduction must:
- define the topic
- explain why it matters
- explain what the reader will learn

SECTION BLUEPRINT
If relevant, naturally include sections such as:
- definition
- how it works
- main types or categories
- benefits
- drawbacks or limitations
- comparisons
- tools / methods / applications
- common mistakes
- future trends
- conclusion

CONTENT DEPTH
- Avoid shallow sections.
- Add examples when useful.
- Add comparisons when relevant.
- Add explanation instead of filler text.

WORD COUNT RULE
- The article must reach the minimum word count.
- If it is too short, add new relevant sections until the minimum is reached.

OUTPUT FORMAT

TITLE: <title>

WORD_COUNT: <number>

ARTICLE_MARKDOWN:
<full markdown article>
`;

  const firstUser = `
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

  const firstResponse = await callClaude({
    system: baseSystem,
    user: firstUser,
    maxTokens: 4200
  });

  let parsed = parseWriterResponse(firstResponse.trim());

  if (countWords(parsed.article_markdown) < minimumWordCount) {
    const expandSystem = `
You are a professional Turkish SEO editor.

Your task is to EXPAND an existing Turkish SEO article.

RULES
- Keep everything in Turkish.
- Preserve the title and main topic.
- Do not rewrite the whole article from scratch.
- Expand weak or short sections.
- Add new relevant H2 or H3 sections if needed.
- Add more explanation, examples, comparisons and practical detail.
- Do not add fluff.
- Make the article feel more complete and authoritative.
- The final article must reach at least the minimum word count.

OUTPUT FORMAT

TITLE: <title>

WORD_COUNT: <number>

ARTICLE_MARKDOWN:
<full expanded markdown article>
`;

    const expandUser = `
Keyword: ${input.keyword}
Topic: ${input.topic}
Target word count: ${targetWordCount}
Minimum acceptable word count: ${minimumWordCount}

Current word count:
${countWords(parsed.article_markdown)}

Current article:
${parsed.article_markdown}

Expand this article until it reaches the minimum acceptable word count.
Focus especially on:
- sections that are too short
- missing comparisons
- missing practical explanations
- missing logical subsections
`;

    const expandedResponse = await callClaude({
      system: expandSystem,
      user: expandUser,
      maxTokens: 4200
    });

    parsed = parseWriterResponse(expandedResponse.trim());
  }

  return {
    title: parsed.title,
    article_markdown: parsed.article_markdown,
    word_count: countWords(parsed.article_markdown)
  };
}

module.exports = { runWriter };
