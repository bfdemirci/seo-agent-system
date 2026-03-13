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
  res.type("application/json").status(200).send(JSON.stringify({
    ok: true,
    message: "SEO AI API çalışıyor"
  }));
});

app.post("/generate", async (req, res) => {
  try {
    const keyword = String(req.body?.keyword || "").trim();
    const topic = String(req.body?.topic || "").trim() || keyword;
    const language = String(req.body?.language || "tr").trim();
    const country = String(req.body?.country || "TR").trim();
    const tone = String(req.body?.tone || "").trim() || "informative";

    let word_count = Number(req.body?.word_count) || 1200;
    if (word_count < 800) word_count = 800;
    if (word_count > 1600) word_count = 1600;

    let outline = [];
    if (Array.isArray(req.body?.outline)) {
      outline = req.body.outline.map((x) => String(x).trim()).filter(Boolean);
    }

    if (!keyword) {
      return res
        .type("application/json")
        .status(400)
        .send(JSON.stringify({
          ok: false,
          error: "keyword zorunludur"
        }));
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

    return res
      .type("application/json")
      .status(200)
      .send(JSON.stringify({
        ok: true,
        result: safeResult,
        seo_score: seoScore
      }));
  } catch (error) {
    console.error("Generate API hatası:", error);

    return res
      .type("application/json")
      .status(500)
      .send(JSON.stringify({
        ok: false,
        error: error?.message || "Bilinmeyen hata"
      }));
  }
});

app.use((err, req, res, next) => {
  console.error("Express fallback hatası:", err);
  return res
    .type("application/json")
    .status(500)
    .send(JSON.stringify({
      ok: false,
      error: err?.message || "Sunucu hatası"
    }));
});

app.listen(PORT, () => {
  console.log(`API server çalışıyor: http://localhost:${PORT}`);
});
