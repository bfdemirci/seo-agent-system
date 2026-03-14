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

async function runWriter(input, briefOutput) {
  const targetWordCount = Number(input.word_count) || 1200;
  const minimumWordCount = Math.max(1000, Math.floor(targetWordCount * 0.9));

  const sections = Array.isArray(briefOutput?.recommended_sections) && briefOutput.recommended_sections.length
    ? briefOutput.recommended_sections
    : [
        "Konuya giriş ve temel tanım",
        "Nasıl çalışır",
        "Temel türler veya kategoriler",
        "Avantajlar",
        "Dezavantajlar veya sınırlamalar",
        "Araçlar / yöntemler / uygulamalar",
        "Sık yapılan hatalar",
        "Gelecek trendleri",
        "Sonuç"
      ];

  const questions = Array.isArray(briefOutput?.questions)
    ? briefOutput.questions
    : [];

  const primaryIntent = briefOutput?.primary_intent || "";

  const system = `
You are a professional Turkish SEO content writer.

Write a high quality Turkish SEO article in Markdown.

LANGUAGE RULES
- Write only in Turkish.
- Do not mix English or other languages into the body text unless absolutely necessary.
- If a foreign term is necessary, explain it in Turkish.

WRITING STYLE
- Write naturally and clearly.
- Avoid generic AI phrases.
- Avoid repetition.
- Write like a human editor.

STRUCTURE RULES
- Use Markdown headings.
- Use exactly one H1 title.
- Use at least 6 H2 headings.
- Use H3 headings when appropriate.
- Finish the main body completely before FAQ style content.

MANDATORY SECTION EXECUTION
- You will receive a list of recommended sections.
- You MUST cover every recommended section in the article body.
- Do not skip sections.
- Do not jump to FAQ or conclusion before the main sections are completed.
- Each major section should contain meaningful explanation, not just 1-2 lines.

INTRODUCTION
The introduction must:
- define the topic
- explain why it matters
- explain what the reader will learn

CONTENT DEPTH
- Avoid shallow sections.
- Add examples when useful.
- Add comparisons when relevant.
- Add practical explanation instead of filler.

WORD COUNT RULE
- The article must reach the minimum word count.
- If it is too short, expand existing sections first.
- If still too short, add one or two additional relevant sections before the conclusion.

ENDING RULE
- The article must end with a complete H2 conclusion section.
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

Recommended sections (must all be covered):
${sections.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Questions to consider:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Important:
- Cover all recommended sections before the conclusion.
- Keep the structure complete and coherent.
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
- Preserve existing structure and headings.
- Expand weak or short sections.
- Ensure all requested sections are fully covered.
- If a section seems missing, add it.
- Complete the conclusion if needed.
- Do not add fluff.
- Do not add markdown fences.

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

Current article word count:
${countWords(parsed.article_markdown)}

Current article:
${parsed.article_markdown}

Instructions:
- Expand the article until it reaches the minimum acceptable word count.
- Make sure every required section is properly covered.
- If FAQ-like content appears too early, keep the main article complete first.
- End with a complete conclusion.
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
