const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { runPipeline } = require("./orchestrator/pipeline");
const { calculateSeoScore } = require("./utils/seoScore");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "SEO AI API çalışıyor"
  });
});

app.post("/generate", async (req, res) => {
  try {
    const keyword = (req.body?.keyword || "").trim();
    const topic = (req.body?.topic || "").trim() || keyword;
    const language = (req.body?.language || "tr").trim();
    const country = (req.body?.country || "TR").trim();
    const tone = (req.body?.tone || "").trim() || "informative";
    const word_count = Number(req.body?.word_count) || 1200;

    let outline = [];
    if (Array.isArray(req.body?.outline)) {
      outline = req.body.outline.map((x) => String(x).trim()).filter(Boolean);
    }

    if (!keyword) {
      return res.status(400).json({
        ok: false,
        error: "keyword zorunludur"
      });
    }

    const input = {
      topic,
      keyword,
      language,
      country,
      tone,
      word_count,
      outline
    };

    const result = await runPipeline(input);

    const safeResult = {
      ...result,
      writer: result.writer || {},
      editor: {
        ...(result.editor || {}),
        revised_article_markdown:
          result.editor?.revised_article_markdown ||
          result.writer?.article_markdown ||
          ""
      },
      seo: result.seo || {}
    };

    const seoScore = calculateSeoScore(safeResult);

    return res.json({
      ok: true,
      result: safeResult,
      seo_score: seoScore
    });
  } catch (error) {
    console.error("Generate API hatası:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Bilinmeyen hata"
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server çalışıyor: http://localhost:${PORT}`);
});
