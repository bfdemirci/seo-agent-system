const { callClaude } = require("../anthropic");
const { safeJson } = require("../utils/safeJson");

async function runTopicCluster(input) {
  const system = `
You are a senior SEO topical authority strategist.

Return ONLY valid JSON.

{
  "pillar_keyword": "",
  "pillar_title": "",
  "cluster_articles": [
    {
      "keyword": "",
      "title": "",
      "intent": "",
      "slug": "",
      "angle": ""
    }
  ]
}
`;

  const user = `
Primary keyword: ${input.keyword}
Language: ${input.language || "Türkçe"}
Country: ${input.country || "Türkiye"}
Tone: ${input.tone || "uzman"}

Instructions:
- Build a topical SEO cluster around the primary keyword.
- Include 12 to 15 article ideas only.
- Mix informational, commercial, comparison, and practical intent where relevant.
- Titles must be natural and clickable.
- Keep titles relatively short.
- Slugs must be short, lowercase, and hyphenated.
- Avoid duplicates.
- Cover beginner, intermediate, and advanced subtopics.
- Make this cluster strong enough to support a pillar SEO content strategy.
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 3200
  });

  return safeJson(
    response,
    {
      pillar_keyword: input.keyword || "",
      pillar_title: "",
      cluster_articles: []
    },
    "Topic Cluster JSON"
  );
}

module.exports = { runTopicCluster };
