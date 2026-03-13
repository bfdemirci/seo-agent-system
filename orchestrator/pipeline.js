const { runPlanner } = require("../agents/planner");
const { runResearch } = require("../agents/research");
const { runBrief } = require("../agents/brief");
const { runWriter } = require("../agents/writer");
const { runClaimExtractor } = require("../agents/claimExtractor");
const { runFactChecker } = require("../agents/factChecker");
const { runEditor } = require("../agents/editor");
const { runSeoOptimizer } = require("../agents/seoOptimizer");
const { runSerpAnalyzer } = require("../agents/serpAnalyzer");
const { runContentGap } = require("../agents/contentGap");
const { exportToCSV } = require("../utils/exportCsv");

async function runPipeline(input) {
  console.log("Pipeline başlıyor...");

  const plannerOutput = await runPlanner(input);
  const researchOutput = await runResearch(input, plannerOutput);
  const serpOutput = await runSerpAnalyzer(input, plannerOutput, researchOutput);
  const contentGapOutput = await runContentGap(
    input,
    plannerOutput,
    researchOutput,
    serpOutput
  );
  const briefOutput = await runBrief(
    input,
    plannerOutput,
    researchOutput,
    serpOutput,
    contentGapOutput
  );
  const writerOutput = await runWriter(input, briefOutput);
  const claimExtractorOutput = await runClaimExtractor(writerOutput);
  const factCheckerOutput = await runFactChecker(claimExtractorOutput);
  const editorOutput = await runEditor(writerOutput, factCheckerOutput);
  const seoOutput = await runSeoOptimizer(input, editorOutput);

  exportToCSV({
    writer: writerOutput,
    editor: editorOutput,
    seo: seoOutput
  });

  return {
    planner: plannerOutput,
    research: researchOutput,
    serp: serpOutput,
    contentGap: contentGapOutput,
    brief: briefOutput,
    writer: writerOutput,
    claimExtractor: claimExtractorOutput,
    factChecker: factCheckerOutput,
    editor: editorOutput,
    seo: seoOutput
  };
}

module.exports = { runPipeline };
