const { runTopicCluster } = require("../agents/topicCluster");

async function main() {
  const keyword = process.argv.slice(2).join(" ").trim();

  if (!keyword) {
    console.log('Kullanım: node scripts/testCluster.js "seo nedir"');
    process.exit(1);
  }

  const result = await runTopicCluster({
    keyword,
    language: "Türkçe",
    country: "Türkiye",
    tone: "uzman"
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("Cluster test hatası:", err.message);
  process.exit(1);
});
