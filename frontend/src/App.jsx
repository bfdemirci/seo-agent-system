import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState("");
  const [seoScore, setSeoScore] = useState(null);

  async function generate() {
    setLoading(true);

    const res = await fetch("https://seo-agent-system.onrender.com/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        keyword
      })
    });

    const data = await res.json();

    if (data.result?.editor?.revised_article_markdown) {
      setArticle(data.result.editor.revised_article_markdown);
    }

    if (data.seo_score) {
      setSeoScore(data.seo_score);
    }

    setLoading(false);
  }

  return (
    <div className="container">

      <h1 className="title">
        <span className="logoBold">8Bitiz</span>{" "}
        <span className="logoLight">Agent</span>
      </h1>

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Anahtar kelime gir..."
      />

      <button onClick={generate}>
        {loading ? "Üretiliyor..." : "Makale Üret"}
      </button>

      {seoScore && (
        <div className="seoScore">
          <h3>SEO Skoru: {seoScore.score}/100</h3>
        </div>
      )}

      {article && (
        <div className="article">
          <ReactMarkdown>{article}</ReactMarkdown>
        </div>
      )}

    </div>
  );
}
