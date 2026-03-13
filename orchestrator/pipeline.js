const { runPlanner } = require("../agents/planner");
const { runResearch } = require("../agents/research");
const { runBrief } = require("../agents/brief");
const { runWriter } = require("../agents/writer");
const { runSeoOptimizer } = require("../agents/seoOptimizer");
const { exportToCSV } = require("../utils/exportCsv");

async function runPipeline(input) {
  console.log("Pipeline başlıyor...");

  const plannerOutput = await runPlanner(input);
  const researchOutput = await runResearch(input, plannerOutput);
  const briefOutput = await runBrief(input, plannerOutput, researchOutput);
  const writerOutput = await runWriter(input, briefOutput);
  const seoOutput = await runSeoOptimizer(input, {
    revised_article_markdown: writerOutput.article_markdown
  });

  const editorOutput = {
    revised_article_markdown: writerOutput.article_markdown
  };

  exportToCSV({
    writer: writerOutput,
    editor: editorOutput,
    seo: seoOutput
  });

  return {
    planner: plannerOutput,
    research: researchOutput,
    brief: briefOutput,
    writer: writerOutput,
    editor: editorOutput,
    seo: seoOutput
  };
}

module.exports = { runPipeline };
