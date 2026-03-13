const { callClaude } = require("../anthropic");
const { safeJson } = require("../utils/safeJson");

async function runBrief(input, plannerOutput, researchOutput) {

  const system = `
Return ONLY JSON.

{
 "title_options": [],
 "primary_intent": "",
 "recommended_sections": [],
 "questions": []
}
`;

  const user = `
Keyword: ${input.keyword}
Topic: ${input.topic}

Planner:
${JSON.stringify(plannerOutput)}

Research:
${JSON.stringify(researchOutput)}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens: 700
  });

  return safeJson(response,{
    title_options:[],
    primary_intent:"",
    recommended_sections:[],
    questions:[]
  },"Brief JSON");
}

module.exports = { runBrief };
