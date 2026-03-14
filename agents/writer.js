const { callClaude } = require("../anthropic");

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function parseWriterResponse(text) {
  const titleMatch = text.match(/TITLE:\s*(.+)/i);
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
    word_count: countWords(article)
  };
}

async function runWriter(input, strategyOutput = {}) {
  const targetWordCount = Number(input.word_count) || 1200;
  const minimumWordCount = Math.max(1000, Math.floor(targetWordCount * 0.9));

  const sections =
    Array.isArray(strategyOutput?.recommended_sections) &&
    strategyOutput.recommended_sections.length
      ? strategyOutput.recommended_sections
      : [
          "Temel tanım",
          "Nasıl çalışır",
          "Ana türler veya kategoriler",
          "Avantajlar",
          "Dezavantajlar",
          "Araçlar veya yöntemler",
          "Sık yapılan hatalar",
          "Gelecek trendleri",
          "Sonuç"
        ];

  const questions = Array.isArray(strategyOutput?.questions)
    ? strategyOutput.questions
    : [];

  const mustCoverTopics = Array.isArray(strategyOutput?.must_cover_topics)
    ? strategyOutput.must_cover_topics
    : [];

  const contentGaps = Array.isArray(strategyOutput?.content_gaps)
    ? strategyOutput.content_gaps
    : [];

  const styleNotes = Array.isArray(strategyOutput?.style_notes)
    ? strategyOutput.style_notes
    : [];

  const primaryIntent = strategyOutput?.primary_intent || "";

  const system = `
You are a professional Turkish SEO content writer.

Write a high-quality Turkish SEO article in Markdown.

LANGUAGE RULES
- Write only in Turkish.
- Do not mix English into the body unless absolutely necessary.
- If a foreign term is needed, explain it naturally in Turkish.

WRITING STYLE
- Write naturally and clearly.
- Avoid generic AI phrasing.
- Avoid repetition.
- Write like a human editor.
- Prefer concrete explanation over vague statements.

STRUCTURE RULES
- Use Markdown headings.
- Use exactly one H1 title.
- Use at least 6 H2 headings.
- Use H3 headings when useful.
- Cover all major sections before the conclusion.

MANDATORY EXECUTION
- Cover every recommended section.
- Cover the must-cover topics naturally.
- Address the likely user intent fully.
- If the draft is too short, expand existing sections first.
- If still too short, add one or two relevant sections before the conclusion.

ENDING RULE
- End with a complete H2 conclusion.
- Do not end abruptly.

OUTPUT FORMAT

TITLE: <title>

ARTICLE_MARKDOWN:
<full markdown article>
`;

  const firstUser = `
Keyword: ${input.keyword}
Topic: ${input.topic}
Language: ${input.language}
Tone: ${input.tone || "informative"}

Primary intent:
${primaryIntent}

Target word count: ${targetWordCount}
Minimum acceptable word count: ${minimumWordCount}

Recommended sections:
${sections.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Must-cover topics:
${mustCoverTopics.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Likely questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Potential content gaps:
${contentGaps.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Style notes:
${styleNotes.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Important:
- Cover all recommended sections before the conclusion.
- Make the article substantial enough to reach the minimum acceptable word count.
`;

  const firstResponse = await callClaude({
    system,
    user: firstUser,
    maxTokens: 4500
  });

  let parsed = parseWriterResponse(firstResponse.trim());

  if (countWords(parsed.article_markdown) < minimumWordCount) {
    const expandSystem = `
You are a professional Turkish SEO editor.

Expand an existing Turkish article.

RULES
- Keep everything in Turkish.
- Preserve structure and headings.
- Expand weak or short sections.
- Ensure all required sections are covered.
- Add missing relevant sections if needed.
- Complete the conclusion.
- Do not add fluff.

OUTPUT FORMAT

TITLE: <title>

ARTICLE_MARKDOWN:
<full expanded markdown article>
`;

    const expandUser = `
Keyword: ${input.keyword}
Target word count: ${targetWordCount}
Minimum acceptable word count: ${minimumWordCount}

Required sections:
${sections.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Must-cover topics:
${mustCoverTopics.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Current article word count:
${countWords(parsed.article_markdown)}

Current article:
${parsed.article_markdown}

Instructions:
- Expand until the article reaches the minimum acceptable word count.
- Keep the article coherent and complete.
- End with a proper conclusion.
`;

    const expandedResponse = await callClaude({
      system: expandSystem,
      user: expandUser,
      maxTokens: 4500
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
