const { callClaude } = require("../anthropic");

async function runBrief(input, plannerOutput, researchOutput) {
  const system = `
ROLE: You are the Brief Agent.

OBJECTIVE:
Create a compact SEO content brief for the writer.

RULES:
- Do NOT return JSON.
- Return in this exact format:

TITLE_OPTIONS:
- title 1
- title 2
- title 3

RECOMMENDED_H1:
<h1 here>

OUTLINE:
1. <heading>
- <subheading>
- <subheading>
- <subheading>

2. <heading>
- <subheading>
- <subheading>
- <subheading>

3. <heading>
- <subheading>
- <subheading>
- <subheading>

4. <heading>
- <subheading>
- <subheading>
- <subheading>

5. <heading>
- <subheading>
- <subheading>
- <subheading>

META_DESCRIPTION_DRAFT:
<meta description here>

- Keep it concise.
- Maximum 6 outline sections.
- Maximum 3 subheadings per section.
- No markdown code fences.
`;

  const user = `
Topic: ${input.topic}
Keyword: ${input.keyword}
Language: ${input.language}
Country: ${input.country}

Planner output:
${JSON.stringify(plannerOutput, null, 2)}

Research output:
${JSON.stringify(researchOutput, null, 2)}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 700
  });

  const text = response.trim();

  const titleBlockMatch = text.match(/TITLE_OPTIONS:\s*([\s\S]*?)RECOMMENDED_H1:/);
  const h1Match = text.match(/RECOMMENDED_H1:\s*([\s\S]*?)OUTLINE:/);
  const outlineMatch = text.match(/OUTLINE:\s*([\s\S]*?)META_DESCRIPTION_DRAFT:/);
  const metaMatch = text.match(/META_DESCRIPTION_DRAFT:\s*([\s\S]*)/);

  if (!titleBlockMatch || !h1Match || !outlineMatch || !metaMatch) {
    console.log("Brief parse hatası:");
    console.log(text);
    throw new Error("Brief output format geçersiz");
  }

  const titleOptions = titleBlockMatch[1]
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.startsWith("- "))
    .map(line => line.replace(/^- /, "").trim())
    .filter(Boolean);

  const recommendedH1 = h1Match[1].trim();

  const outlineText = outlineMatch[1].trim();
  const sections = outlineText.split(/\n(?=\d+\.\s)/);

  const outline = sections
    .map(section => {
      const lines = section
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

      if (lines.length === 0) return null;

      const heading = lines[0].replace(/^\d+\.\s*/, "").trim();
      const subheadings = lines
        .slice(1)
        .filter(line => line.startsWith("- "))
        .map(line => line.replace(/^- /, "").trim())
        .filter(Boolean);

      return { heading, subheadings };
    })
    .filter(Boolean);

  const metaDescriptionDraft = metaMatch[1].trim();

  return {
    title_options: titleOptions,
    recommended_h1: recommendedH1,
    outline,
    meta_description_draft: metaDescriptionDraft
  };
}

module.exports = { runBrief };
