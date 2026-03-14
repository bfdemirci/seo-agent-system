const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { runPipeline } = require("./orchestrator/pipeline");
const { calculateSeoScore } = require("./utils/seoScore");
const { runTopicCluster } = require("./agents/topicCluster");

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


app.post("/api/cluster", async (req, res) => {
  try {
    const {
      keyword = "",
      language = "Türkçe",
      country = "Türkiye",
      tone = "uzman"
    } = req.body || {};

    if (!keyword.trim()) {
      return res.status(400).json({
        ok: false,
        error: "keyword zorunludur"
      });
    }

    const result = await runTopicCluster({
      keyword: keyword.trim(),
      language,
      country,
      tone
    });

    return res.json({
      ok: true,
      result
    });
  } catch (error) {
    console.error("Cluster API hatası:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Bilinmeyen hata"
    });
  }
});


app.post("/api/programmatic", async (req, res) => {
  try {
    const {
      keywords = [],
      language = "Türkçe",
      country = "Türkiye",
      tone = "uzman",
      word_count = 1300,
      max_articles_per_keyword = 3
    } = req.body || {};

    if (!Array.isArray(keywords) || !keywords.length) {
      return res.status(400).json({
        ok: false,
        error: "keywords dizisi gerekli"
      });
    }

    const cleanKeywords = keywords
      .map((x) => String(x || "").trim())
      .filter(Boolean);

    if (!cleanKeywords.length) {
      return res.status(400).json({
        ok: false,
        error: "Geçerli keyword bulunamadı"
      });
    }

    const output = [];

    for (const seedKeyword of cleanKeywords) {
      const cluster = await runTopicCluster({
        keyword: seedKeyword,
        language,
        country,
        tone
      });

      const children = (cluster.cluster_articles || []).slice(
        0,
        Math.max(1, Math.min(Number(max_articles_per_keyword) || 3, 5))
      );

      const generated_articles = [];

      for (const item of children) {
        const result = await runPipeline({
          keyword: item.keyword,
          topic: item.title || item.keyword,
          language,
          country,
          tone,
          word_count
        });

        generated_articles.push({
          keyword: item.keyword,
          title: item.title,
          slug: item.slug,
          intent: item.intent,
          angle: item.angle,
          article_title: result?.writer?.title || "",
          seo_title: result?.seo?.seo_title || "",
          meta_description: result?.seo?.meta_description || "",
          article_markdown:
            result?.finalizer?.final_article_markdown ||
            result?.editor?.revised_article_markdown ||
            result?.writer?.article_markdown ||
            ""
        });
      }

      output.push({
        seed_keyword: seedKeyword,
        pillar_title: cluster.pillar_title || "",
        generated_articles
      });
    }

    return res.json({
      ok: true,
      result: output
    });
  } catch (error) {
    console.error("Programmatic API hatası:", error);
    return res.status(500).json({
      ok: false,
      error: error.message || "Bilinmeyen hata"
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server çalışıyor: http://localhost:${PORT}`);
});


app.post("/api/generate", async (req, res) => {
  try {
    const { keyword, topic, tone } = req.body;

    if (!keyword) {
      return res.status(400).json({
        ok: false,
        error: "keyword gerekli"
      });
    }

    const input = {
      keyword,
      topic: topic || keyword,
      language: "Türkçe",
      country: "Türkiye",
      tone: tone || "informative",
      word_count: 1300
    };

    const result = await runPipeline(input);

    res.json({
      ok: true,
      result
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: error.message || "Bilinmeyen hata"
    });
  }
});

