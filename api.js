const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { runPipeline } = require("./orchestrator/pipeline");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

function parseCSV(content) {
  const lines = content
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(",");
    const row = {};

    headers.forEach((header, index) => {
      row[header] = (values[index] || "").trim();
    });

    return row;
  });
}

function escapeCSV(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

function buildBatchCSV(results) {
  const headers = [
    "topic",
    "keyword",
    "title",
    "seo_title",
    "meta_description",
    "slug",
    "article",
    "faq_questions",
    "internal_links",
    "status",
    "error"
  ];

  const rows = [headers.map(escapeCSV).join(",")];

  for (const item of results) {
    const row = [
      item.topic || "",
      item.keyword || "",
      item.title || "",
      item.seo_title || "",
      item.meta_description || "",
      item.slug || "",
      item.article || "",
      item.faq_questions || "",
      item.internal_links || "",
      item.status || "",
      item.error || ""
    ];

    rows.push(row.map(escapeCSV).join(","));
  }

  return rows.join("\n");
}

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "SEO AI API çalışıyor"
  });
});

app.post("/generate", async (req, res) => {
  try {
    const input = req.body;

    if (!input || !input.topic || !input.keyword || !input.language || !input.country) {
      return res.status(400).json({
        ok: false,
        error: "topic, keyword, language, country zorunludur"
      });
    }

    const result = await runPipeline(input);

    return res.json({
      ok: true,
      result
    });
  } catch (error) {
    console.error("Generate API hatası:", error);

    return res.status(500).json({
      ok: false,
      error: error.message || "Bilinmeyen hata"
    });
  }
});

app.post("/batch-generate", async (req, res) => {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "rows array zorunludur"
      });
    }

    const batchResults = [];

    for (const input of rows) {
      try {
        if (!input.topic || !input.keyword || !input.language || !input.country) {
          batchResults.push({
            topic: input.topic || "",
            keyword: input.keyword || "",
            status: "error",
            error: "Eksik alan: topic, keyword, language, country"
          });
          continue;
        }

        console.log(`Batch çalışıyor: ${input.keyword}`);

        const result = await runPipeline(input);

        batchResults.push({
          topic: input.topic,
          keyword: input.keyword,
          title: result.writer?.title || "",
          seo_title: result.seo?.seo_title || "",
          meta_description: result.seo?.meta_description || "",
          slug: result.seo?.slug || "",
          article: result.editor?.revised_article_markdown || "",
          faq_questions: (result.seo?.faq_questions || []).join(" | "),
          internal_links: (result.seo?.internal_link_suggestions || []).join(" | "),
          status: "success",
          error: ""
        });
      } catch (error) {
        batchResults.push({
          topic: input.topic || "",
          keyword: input.keyword || "",
          status: "error",
          error: error.message || "Bilinmeyen hata"
        });
      }
    }

    const csvContent = buildBatchCSV(batchResults);
    fs.writeFileSync("api_batch_output.csv", csvContent, "utf8");

    return res.json({
      ok: true,
      count: batchResults.length,
      results: batchResults
    });
  } catch (error) {
    console.error("Batch API hatası:", error);

    return res.status(500).json({
      ok: false,
      error: error.message || "Bilinmeyen hata"
    });
  }
});

app.post("/batch-generate-csv", async (req, res) => {
  try {
    const { csvText } = req.body;

    if (!csvText || typeof csvText !== "string") {
      return res.status(400).json({
        ok: false,
        error: "csvText zorunludur"
      });
    }

    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "CSV içinde veri yok"
      });
    }

    const batchResults = [];

    for (const input of rows) {
      try {
        if (!input.topic || !input.keyword || !input.language || !input.country) {
          batchResults.push({
            topic: input.topic || "",
            keyword: input.keyword || "",
            status: "error",
            error: "Eksik alan: topic, keyword, language, country"
          });
          continue;
        }

        console.log(`CSV batch çalışıyor: ${input.keyword}`);

        const result = await runPipeline(input);

        batchResults.push({
          topic: input.topic,
          keyword: input.keyword,
          title: result.writer?.title || "",
          seo_title: result.seo?.seo_title || "",
          meta_description: result.seo?.meta_description || "",
          slug: result.seo?.slug || "",
          article: result.editor?.revised_article_markdown || "",
          faq_questions: (result.seo?.faq_questions || []).join(" | "),
          internal_links: (result.seo?.internal_link_suggestions || []).join(" | "),
          status: "success",
          error: ""
        });
      } catch (error) {
        batchResults.push({
          topic: input.topic || "",
          keyword: input.keyword || "",
          status: "error",
          error: error.message || "Bilinmeyen hata"
        });
      }
    }

    const csvContent = buildBatchCSV(batchResults);
    fs.writeFileSync("api_batch_output.csv", csvContent, "utf8");

    return res.json({
      ok: true,
      count: batchResults.length,
      results: batchResults,
      download_path: "/download-csv"
    });
  } catch (error) {
    console.error("Batch CSV API hatası:", error);

    return res.status(500).json({
      ok: false,
      error: error.message || "Bilinmeyen hata"
    });
  }
});

app.get("/download-csv", (req, res) => {
  const filePath = path.join(__dirname, "api_batch_output.csv");

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      ok: false,
      error: "CSV dosyası bulunamadı"
    });
  }

  res.download(filePath, "api_batch_output.csv");
});

app.listen(PORT, () => {
  console.log(`API server çalışıyor: http://localhost:${PORT}`);
});
