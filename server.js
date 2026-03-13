require("dotenv").config();
const { runPipeline } = require("./orchestrator/pipeline");

async function main() {
  try {
    const result = await runPipeline({
      topic: "SEO AI agent system nasıl kurulur?",
      keyword: "seo ai agent system",
      language: "Turkish",
      country: "TR"
    });

    console.log("Final sonuç:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Pipeline HATASI:");
    console.error(error);
  }
}

main();
