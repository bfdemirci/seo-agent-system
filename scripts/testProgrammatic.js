const { runTopicCluster } = require("../agents/topicCluster");
const { runPipeline } = require("../orchestrator/pipeline");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const raw = process.argv.slice(2).join(" ").trim();

  if (!raw) {
    console.log('Kullanım: node scripts/testProgrammatic.js "seo nedir, yapay zeka nedir"');
    process.exit(1);
  }

  const keywords = raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  const output = [];

  for (const keyword of keywords) {
    console.log(`\n=== Keyword: ${keyword} ===`);

    const cluster = await runTopicCluster({
      keyword,
      language: "Türkçe",
      country: "Türkiye",
      tone: "uzman",
    });

    const children = (cluster.cluster_articles || []).slice(0, 3);
    const generated = [];

    for (const item of children) {
      console.log(`Makale üretiliyor: ${item.keyword}`);

      const result = await runPipeline({
        keyword: item.keyword,
        topic: item.title || item.keyword,
        language: "Türkçe",
        country: "Türkiye",
        tone: "uzman",
        word_count: 1300,
      });

      generated.push({
        keyword: item.keyword,
        title: item.title,
        slug: item.slug,
        intent: item.intent,
        angle: item.angle,
        article_title: result?.writer?.title || "",
        seo_title: result?.seo?.seo_title || "",
        meta_description: result?.seo?.meta_description || "",
      });

      await sleep(1200);
    }

    output.push({
      seed_keyword: keyword,
      pillar_title: cluster.pillar_title || "",
      generated_articles: generated,
    });
  }

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error("Programmatic test hatası:", err.message);
  process.exit(1);
});
