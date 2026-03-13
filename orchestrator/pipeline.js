const { runPlanner } = require("../agents/planner");
const { runResearch } = require("../agents/research");
const { runBrief } = require("../agents/brief");
const { runWriter } = require("../agents/writer");
const { runClaimExtractor } = require("../agents/claimExtractor");
const { runFactChecker } = require("../agents/factChecker");
const { runEditor } = require("../agents/editor");
const { runSeoOptimizer } = require("../agents/seoOptimizer");
const { runSerpAnalyzer } = require("../agents/serpAnalyzer");
const { exportToCSV } = require("../utils/exportCsv");

async function runPipeline(input) {
  console.log("Pipeline başlıyor...\n");

  console.log("Planner çalışıyor...");
  const plannerOutput = await runPlanner(input);
  console.log("Planner tamamlandı.\n");

  console.log("Research çalışıyor...");
  const researchOutput = await runResearch(input, plannerOutput);
  console.log("Research tamamlandı.\n");
console.log("SERP Analyzer çalışıyor...");
const serp = await runSerpAnalyzer(input, planner, research);
console.log("SERP Analyzer tamamlandı.");

  console.log("Brief çalışıyor...");
const briefOutput = await runBrief(input, plannerOutput, researchOutput, serp);
console.log("Brief tamamlandı.\n");

  console.log("Writer çalışıyor...");
  const writerOutput = await runWriter(input, briefOutput);
  console.log("Writer tamamlandı.\n");

  console.log("Claim Extractor çalışıyor...");
  const claimExtractorOutput = await runClaimExtractor(writerOutput);
  console.log("Claim Extractor tamamlandı.\n");

  console.log("Fact Checker çalışıyor...");
  const factCheckerOutput = await runFactChecker(claimExtractorOutput);
  console.log("Fact Checker tamamlandı.\n");

  console.log("Editor çalışıyor...");
  const editorOutput = await runEditor(writerOutput, factCheckerOutput);
  console.log("Editor tamamlandı.\n");

  console.log("SEO Optimizer çalışıyor...");
  const seoOutput = await runSeoOptimizer(input, editorOutput);
  console.log("SEO Optimizer tamamlandı.\n");

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
    claimExtractor: claimExtractorOutput,
    factChecker: factCheckerOutput,
    editor: editorOutput,
    seo: seoOutput
  };
}

module.exports = { runPipeline };
