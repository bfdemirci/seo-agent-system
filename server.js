const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { runPipeline } = require("./orchestrator/pipeline");

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
    const { topic, keyword, language, country } = req.body || {};

    if (!topic || !keyword || !language || !country) {
      return res.status(400).json({
        ok: false,
        error: "topic, keyword, language, country zorunludur"
      });
    }

    const input = { topic, keyword, language, country };
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

app.listen(PORT, () => {
  console.log(`API server çalışıyor: http://localhost:${PORT}`);
});
