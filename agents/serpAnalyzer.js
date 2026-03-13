const { callClaude } = require("../anthropic");
const { safeJson } = require("../utils/safeJson");

async function runSerpAnalyzer(input) {

  const system = `
Return ONLY JSON.

{
 "search_intent":"",
 "primary_angle":"",
 "paa_topics":[],
 "must_have_sections":[]
}
`;

  const user = `
Keyword: ${input.keyword}
Topic: ${input.topic}
`;

  const response = await callClaude({
    system,
    user,
    maxTokens:700
  });

  return safeJson(response,{
    search_intent:"",
    primary_angle:"",
    paa_topics:[],
    must_have_sections:[]
  },"SERP JSON");
}

module.exports = { runSerpAnalyzer };
