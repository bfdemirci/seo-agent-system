const fs = require("fs");
const { runPipeline } = require("./orchestrator/pipeline");

function parseCSV(content) {
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map(line => {
    const values = line.split(",");
    const row = {};
    headers.forEach((h, i) => {
      row[h.trim()] = (values[i] || "").trim();
    });
    return row;
  });
}

function escapeCSV(value) {
  if (value === null || value === undefined) return '""';
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function main() {
  const csvContent = fs.readFileSync("keywords.csv", "utf8");
  const rows = parseCSV(csvContent);

  const outputHeaders = [
    "topic",
    "keyword",
    "title",
    "seo_title",
    "meta_description",
    "slug",
    "article",
    "faq_questions",
    "internal_links"
  ];

  const outputRows = [outputHeaders.map(escapeCSV).join(",")];

  for (const input of rows) {
    console.log(`\nÇalışıyor: ${input.keyword}\n`);

    try {
      const result = await runPipeline(input);

      const row = [
        input.topic,
        input.keyword,
        result.writer?.title || "",
        result.seo?.seo_title || "",
        result.seo?.meta_description || "",
        result.seo?.slug || "",
        result.editor?.revised_article_markdown || "",
        (result.seo?.faq_questions || []).join(" | "),
        (result.seo?.internal_link_suggestions || []).join(" | ")
      ];

      outputRows.push(row.map(escapeCSV).join(","));
    } catch (err) {
      console.error(`Hata: ${input.keyword}`, err.message);

      const row = [
        input.topic,
        input.keyword,
        "ERROR",
        "",
        err.message,
        "",
        "",
        "",
        ""
      ];

      outputRows.push(row.map(escapeCSV).join(","));
    }
  }

  fs.writeFileSync("batch_output.csv", outputRows.join("\n"), "utf8");
  console.log("\nBitti: batch_output.csv oluşturuldu.");
}

main();
