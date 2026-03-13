const { callClaude } = require("../anthropic");
const { safeJson } = require("../utils/safeJson");

async function runResearch(input, plannerOutput) {
  const system = `
Return ONLY JSON.

{
 "competitor_angles": [],
 "important_entities": [],
 "questions_people_ask": [],
 "content_gaps": []
}
`;

  const user = `
Topic: ${input.topic}
Keyword: ${input.keyword}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 600
  });

  return safeJson(response,{
    competitor_angles:[],
    important_entities:[],
    questions_people_ask:[],
    content_gaps:[]
  },"Research JSON");
}

module.exports = { runResearch };
