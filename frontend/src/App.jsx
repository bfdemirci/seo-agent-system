import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [topic, setTopic] = useState("");
  const [outline, setOutline] = useState("");
  const [tone, setTone] = useState("");
  const [wordCount, setWordCount] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [seoScore, setSeoScore] = useState(null);

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
      alert("Kopyalandı");
    } catch {
      alert("Kopyalanamadı");
    }
  };

  const downloadFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const generate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setSeoScore(null);

    try {
      const body = {
        keyword: keyword.trim()
      };

      if (topic.trim()) body.topic = topic.trim();

      if (outline.trim()) {
        body.outline = outline
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
      }

      if (tone.trim()) body.tone = tone.trim();

      if (wordCount && !isNaN(Number(wordCount))) {
        body.word_count = Number(wordCount);
      }

      const res = await fetch("https://seo-agent-system.onrender.com/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const rawText = await res.text();
      let data = null;

      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Sunucu JSON dışı cevap verdi: ${rawText.slice(0, 300)}`);
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error || `API hatası: ${res.status}`);
      }

      setResult(data.result || null);
      setSeoScore(data.seo_score || null);
    } catch (err) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const article =
    result?.editor?.revised_article_markdown ||
    result?.writer?.article_markdown ||
    "";

  const title = result?.writer?.title || "";
  const seoTitle = result?.seo?.seo_title || "";
  const metaDescription = result?.seo?.meta_description || "";
  const slug = result?.seo?.slug || "";
  const faqQuestions = result?.seo?.faq_questions || [];
  const internalLinks = result?.seo?.internal_link_suggestions || [];

  const exportMarkdown = () => {
    if (!article) return;

    const markdown = `# ${title || ""}

## SEO Başlık
${seoTitle || ""}

## Meta Açıklama
${metaDescription || ""}

## Slug
${slug || ""}

## Makale
${article || ""}

## SSS
${faqQuestions.map((item) => `- ${item}`).join("\n")}

## İç Link Önerileri
${internalLinks.map((item) => `- ${item}`).join("\n")}
`;

    downloadFile(`${slug || "article"}.md`, markdown, "text/markdown;charset=utf-8");
  };

  const exportHTML = () => {
    if (!article) return;

    const html = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>${seoTitle || title || "Makale"}</title>
  <meta name="description" content="${(metaDescription || "").replace(/"/g, "&quot;")}" />
</head>
<body>
  <h1>${title || ""}</h1>
  <h2>SEO Başlık</h2>
  <p>${seoTitle || ""}</p>
  <h2>Meta Açıklama</h2>
  <p>${metaDescription || ""}</p>
  <h2>Slug</h2>
  <p>${slug || ""}</p>
  <h2>Makale</h2>
  <pre>${(article || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
  <h2>SSS</h2>
  <ul>${faqQuestions.map((item) => `<li>${item}</li>`).join("")}</ul>
  <h2>İç Link Önerileri</h2>
  <ul>${internalLinks.map((item) => `<li>${item}</li>`).join("")}</ul>
</body>
</html>`;

    downloadFile(`${slug || "article"}.html`, html, "text/html;charset=utf-8");
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="logo">
          <span className="logoBold">8Bitiz</span>
          <span className="logoLight"> Agent</span>
        </h1>

        <div className="formCard">
          <div className="field">
            <label>Anahtar Kelime</label>
            <input
              type="text"
              placeholder="Örn: leasing nedir"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Başlık / Topic (opsiyonel)</label>
            <input
              type="text"
              placeholder="Boş bırakırsan sistem üretir"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Tone (opsiyonel)</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="">Otomatik</option>
              <option value="informative">Bilgilendirici</option>
              <option value="kurumsal">Kurumsal</option>
              <option value="samimi">Samimi</option>
              <option value="uzman">Uzman</option>
              <option value="satış odaklı">Satış Odaklı</option>
            </select>
          </div>

          <div className="field">
            <label>Kelime Sayısı (opsiyonel)</label>
            <input
              type="number"
              placeholder="Örn: 1200"
              value={wordCount}
              onChange={(e) => setWordCount(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Outline (opsiyonel)</label>
            <textarea
              rows="6"
              placeholder={`Her satıra bir başlık yaz.

Örn:
Leasing Nedir
Leasing Türleri
Avantajları
Dezavantajları`}
              value={outline}
              onChange={(e) => setOutline(e.target.value)}
            />
          </div>

          <button
            className="generateBtn"
            onClick={generate}
            disabled={loading || !keyword.trim()}
          >
            {loading ? "Üretiliyor..." : "Makale Üret"}
          </button>
        </div>

        {error && <div className="errorBox">{error}</div>}

        {seoScore && (
          <div className="resultCard">
            <div className="cardHeader">
              <h3>SEO Skoru</h3>
            </div>
            <p><strong>{seoScore.score}/100</strong></p>
            {Array.isArray(seoScore.checks) && seoScore.checks.length > 0 && (
              <ul>
                {seoScore.checks.map((item, i) => (
                  <li key={i}>
                    {item.ok ? "✓" : "✗"} {item.label}
                    {item.value !== undefined ? ` (${item.value})` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {result && (
          <div className="results">
            <div className="resultCard">
              <div className="cardHeader">
                <h3>Başlık</h3>
                <button onClick={() => copyText(title)}>Kopyala</button>
              </div>
              <p>{title}</p>
            </div>

            <div className="resultCard">
              <div className="cardHeader">
                <h3>SEO Başlık</h3>
                <button onClick={() => copyText(seoTitle)}>Kopyala</button>
              </div>
              <p>{seoTitle}</p>
            </div>

            <div className="resultCard">
              <div className="cardHeader">
                <h3>Meta Açıklama</h3>
                <button onClick={() => copyText(metaDescription)}>Kopyala</button>
              </div>
              <p>{metaDescription}</p>
            </div>

            <div className="resultCard">
              <div className="cardHeader">
                <h3>Slug</h3>
                <button onClick={() => copyText(slug)}>Kopyala</button>
              </div>
              <p>{slug}</p>
            </div>

            <div className="resultCard">
              <div className="cardHeader">
                <h3>Makale</h3>
                <div className="buttonGroup">
                  <button onClick={() => copyText(article)}>Kopyala</button>
                  <button onClick={exportMarkdown}>Markdown İndir</button>
                  <button onClick={exportHTML}>HTML İndir</button>
                </div>
              </div>
              <div className="articleContent">
                <ReactMarkdown>{article}</ReactMarkdown>
              </div>
            </div>

            <div className="resultCard">
              <div className="cardHeader">
                <h3>SSS</h3>
                <button onClick={() => copyText(faqQuestions.join("\n"))}>Kopyala</button>
              </div>
              <ul>
                {faqQuestions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="resultCard">
              <div className="cardHeader">
                <h3>İç Link Önerileri</h3>
                <button onClick={() => copyText(internalLinks.join("\n"))}>Kopyala</button>
              </div>
              <ul>
                {internalLinks.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
