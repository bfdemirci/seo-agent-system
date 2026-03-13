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

Your job is to write a high quality SEO article that feels like a complete guide.

STRICT RULES:

- The article MUST reach the minimum word count.
- Do not stop early.
- Expand sections with real explanations and examples.
- Avoid shallow sections.
- Avoid repetition.
- Write naturally in Turkish.

STRUCTURE RULES:

- Use exactly one H1 title.
- Use multiple H2 sections.
- Use H3 subsections when useful.
- Large sections should be divided into logical subsections.

INTRODUCTION RULES:

The introduction must:
- clearly define the topic
- explain why the topic matters
- briefly explain what the reader will learn

CONTENT DEPTH RULES:

- Each section must contain meaningful explanation.
- Add examples when helpful.
- Add comparisons when relevant.
- Add step explanations when relevant.
- Avoid thin sections.

SERP INTELLIGENCE:

- If sections are missing, add logical sections users expect.
- Ensure the article feels like a complete SEO guide.

COMPARISON:

When relevant include:
- advantages vs disadvantages
- comparisons
- alternative approaches

GOAL:

Write an authoritative, helpful and comprehensive article.
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
