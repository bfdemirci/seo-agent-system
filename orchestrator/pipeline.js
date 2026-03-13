const { runPlanner } = require("../agents/planner");
const { runResearch } = require("../agents/research");
const { runBrief } = require("../agents/brief");
const { runWriter } = require("../agents/writer");
const { runSeoOptimizer } = require("../agents/seoOptimizer");
const { exportToCSV } = require("../utils/exportCsv");

async function safeRun(fn, args, fallback, label) {
  try {
    console.log(label + " çalışıyor...");
    return await fn(...args);
  } catch (err) {
    console.log(label + " hata verdi, fallback kullanılıyor");
    console.log(err.message);
    return fallback;
  }
}

async function runPipeline(input) {
  console.log("Pipeline başlıyor...");

  const plannerOutput = await safeRun(
    runPlanner,
    [input],
    {},
    "planner"
  );

  const researchOutput = await safeRun(
    runResearch,
    [input, plannerOutput],
    {},
    "research"
  );

  const briefOutput = await safeRun(
    runBrief,
    [input, plannerOutput, researchOutput],
    {
      title_options: [],
      primary_intent: "",
      recommended_sections: [],
      questions: []
    },
    "brief"
  );

  const writerOutput = await safeRun(
    runWriter,
    [input, briefOutput],
    {
      title: input.keyword,
      article_markdown: ""
    },
    "writer"
  );

  const seoOutput = await safeRun(
    runSeoOptimizer,
    [input, { revised_article_markdown: writerOutput.article_markdown }],
    {
      seo_title: "",
      meta_description: "",
      slug: "",
      faq: [],
      internal_links: []
    },
    "seo"
  );

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
