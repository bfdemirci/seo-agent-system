const { runPlanner } = require("../agents/planner");
const { runResearch } = require("../agents/research");
const { runBrief } = require("../agents/brief");
const { runWriter } = require("../agents/writer");
const { runEditor } = require("../agents/editor");
const { runFinalizer } = require("../agents/finalizer");
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

  const editorOutput = await safeRun(
    runEditor,
    [writerOutput],
    {
      revised_article_markdown: writerOutput.article_markdown || ""
    },
    "editor"
  );

  const finalizerOutput = await safeRun(
    runFinalizer,
    [editorOutput],
    {
      final_article_markdown: editorOutput.revised_article_markdown || ""
    },
    "finalizer"
  );

  const seoOutput = await safeRun(
    runSeoOptimizer,
    [input, { article_markdown: finalizerOutput.final_article_markdown }],
    {
      seo_title: "",
      meta_description: "",
      slug: "",
      faq_questions: [],
      internal_link_suggestions: [],
      schema_type: "Article"
    },
    "seo"
  );

  exportToCSV({
    writer: writerOutput,
    editor: editorOutput,
    finalizer: finalizerOutput,
    seo: seoOutput
  });

  return {
    planner: plannerOutput,
    research: researchOutput,
    brief: briefOutput,
    writer: writerOutput,
    editor: editorOutput,
    finalizer: finalizerOutput,
    seo: seoOutput
  };
}

module.exports = { runPipeline };
