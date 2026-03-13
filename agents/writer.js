const { callClaude } = require("../anthropic");

async function runWriter(input, briefOutput) {
  const targetWordCount = Number(input.word_count) || 1200;
  const minimumWordCount = Math.max(900, Math.floor(targetWordCount * 0.85));

  const sections = Array.isArray(briefOutput?.recommended_sections)
    ? briefOutput.recommended_sections
    : [];

  const questions = Array.isArray(briefOutput?.questions)
    ? briefOutput.questions
    : [];

  const primaryIntent = briefOutput?.primary_intent || "";

  const system = `
You are a professional Turkish SEO content writer.

Your job is to write a strong, useful, search-intent-matching article in Turkish Markdown.

STRICT RULES:
- The article MUST be at least the minimum word count requested.
- Do not stop early.
- Expand sections with useful detail, examples, comparisons, and explanations.
- Do not use filler or empty repetition.
- Write naturally and clearly.
- Use exactly one H1 title.
- Use at least 4 H2 headings.
- Use at least 2 meaningful H3 headings.
- H3 headings must feel natural, not forced.
- The introduction must answer the search query directly.
- The article should feel better than a generic first-page SEO article.

SERP-INTELLIGENCE RULES:
- Match likely user intent closely.
- Cover the obvious subtopics a user expects to see.
- Include comparison, process, definition, benefit, and caution angles when relevant.
- Answer likely follow-up questions naturally inside the article.
- Make the article feel complete, not shallow.
- If recommended sections are too few, intelligently add missing sections users expect.
- Choose sections that naturally fit the topic.
- For informational topics include definition, explanation and context.
- For practical topics include steps, process or how it works.
- For decision topics include comparison, advantages and disadvantages.
- Never force irrelevant sections.
- Ensure the article structure feels complete like a strong first-page SEO article.

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

Primary intent:
${primaryIntent}

Recommended sections:
${JSON.stringify(sections, null, 2)}

Questions to answer:
${JSON.stringify(questions, null, 2)}

Instructions:
- Make the article substantial enough to meet the minimum acceptable word count.
- If the topic is broad, add useful subsections.
- If the topic is informational, explain key concepts clearly.
- Use practical detail instead of fluff.
- If relevant, include:
  - what it is
  - how it works
  - advantages
  - disadvantages
  - who it is suitable for
  - process / steps
  - frequently asked questions
- Prefer depth and clarity over decoration.
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
