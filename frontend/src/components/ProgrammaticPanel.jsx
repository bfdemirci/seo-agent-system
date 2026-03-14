import { useMemo, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000";

function downloadCsv(filename, rows) {
  const escapeCell = (value) => {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

export default function ProgrammaticPanel() {
  const [text, setText] = useState("");
  const [tone, setTone] = useState("uzman");
  const [wordCount, setWordCount] = useState(1300);
  const [maxArticles, setMaxArticles] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState([]);

  const keywords = useMemo(() => {
    return text
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [text]);

  const csvRows = useMemo(() => {
    const rows = [[
      "seed_keyword",
      "focus_keyword",
      "title",
      "seo_title",
      "meta_description",
      "slug",
      "intent",
      "angle",
      "article_markdown"
    ]];

    for (const seed of result || []) {
      for (const article of seed.generated_articles || []) {
        rows.push([
          seed.seed_keyword || "",
          article.keyword || "",
          article.article_title || article.title || "",
          article.seo_title || "",
          article.meta_description || "",
          article.slug || "",
          article.intent || "",
          article.angle || "",
          article.article_markdown || ""
        ]);
      }
    }

    return rows;
  }, [result]);

  async function handleRun() {
    if (!keywords.length) {
      setError("En az bir keyword gir.");
      return;
    }

    setLoading(true);
    setError("");
    setResult([]);

    try {
      const res = await fetch(`${API_BASE}/api/programmatic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          keywords,
          tone,
          word_count: Number(wordCount) || 1300,
          max_articles_per_keyword: Number(maxArticles) || 2
        })
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Programmatic işlem başarısız.");
      }

      setResult(data.result || []);
    } catch (err) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadCsv() {
    if (!result.length) return;
    downloadCsv("programmatic-output.csv", csvRows);
  }

  return (
    <section
      style={{
        marginTop: 32,
        padding: 20,
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>Programmatic SEO Mode</h2>
        <p style={{ marginTop: 8, opacity: 0.8 }}>
          Çoklu seed keyword ver, sistem cluster çıkarıp her biri için makale üretsin.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr auto auto",
          gap: 12,
          alignItems: "end",
        }}
      >
        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Seed Keyword Listesi</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"seo nedir\nyapay zeka nedir\nbacklink nedir"}
            style={{
              width: "100%",
              minHeight: 140,
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "inherit",
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Tone</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "inherit",
              outline: "none",
            }}
          >
            <option value="uzman">Uzman</option>
            <option value="bilgilendirici">Bilgilendirici</option>
            <option value="samimi">Samimi</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Kelime</label>
          <input
            type="number"
            value={wordCount}
            onChange={(e) => setWordCount(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "inherit",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Makale / Keyword</label>
          <input
            type="number"
            min="1"
            max="5"
            value={maxArticles}
            onChange={(e) => setMaxArticles(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
              color: "inherit",
              outline: "none",
            }}
          />
        </div>

        <button
          onClick={handleRun}
          disabled={loading}
          style={{
            height: 46,
            padding: "0 18px",
            borderRadius: 12,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {loading ? "Çalışıyor..." : "Programmatic Çalıştır"}
        </button>

        <button
          onClick={handleDownloadCsv}
          disabled={!result.length}
          style={{
            height: 46,
            padding: "0 18px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "inherit",
            cursor: !result.length ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          CSV İndir
        </button>
      </div>

      <div style={{ marginTop: 10, opacity: 0.75 }}>
        Toplam seed keyword: {keywords.length}
      </div>

      {error ? (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 12,
            background: "rgba(255,0,0,0.08)",
            border: "1px solid rgba(255,0,0,0.18)",
          }}
        >
          {error}
        </div>
      ) : null}

      {result.length ? (
        <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
          {result.map((seed, idx) => (
            <div
              key={`${seed.seed_keyword}-${idx}`}
              style={{
                padding: 16,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.025)",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 18 }}>
                {seed.seed_keyword}
              </div>
              <div style={{ marginTop: 6, opacity: 0.8 }}>
                <strong>Pillar:</strong> {seed.pillar_title}
              </div>
              <div style={{ marginTop: 6, opacity: 0.8 }}>
                <strong>Üretilen Makale:</strong> {seed.generated_articles?.length || 0}
              </div>

              <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
                {(seed.generated_articles || []).map((article, i) => (
                  <div
                    key={`${article.slug}-${i}`}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 16 }}>
                      {article.article_title || article.title}
                    </div>

                    <div style={{ marginTop: 8, opacity: 0.8 }}>
                      <strong>Keyword:</strong> {article.keyword}
                    </div>
                    <div style={{ marginTop: 4, opacity: 0.8 }}>
                      <strong>SEO Title:</strong> {article.seo_title}
                    </div>
                    <div style={{ marginTop: 4, opacity: 0.8 }}>
                      <strong>Slug:</strong> {article.slug}
                    </div>
                    <div style={{ marginTop: 4, opacity: 0.8 }}>
                      <strong>Intent:</strong> {article.intent}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        marginTop: 12,
                      }}
                    >
                      <button
                        onClick={() => copyText(article.article_markdown || "")}
                        style={{
                          height: 38,
                          padding: "0 14px",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "transparent",
                          color: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        Markdown Kopyala
                      </button>

                      <button
                        onClick={() =>
                          copyText(
                            JSON.stringify(article, null, 2)
                          )
                        }
                        style={{
                          height: 38,
                          padding: "0 14px",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.12)",
                          background: "transparent",
                          color: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        JSON Kopyala
                      </button>
                    </div>

                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 12,
                        background: "rgba(0,0,0,0.12)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        maxHeight: 260,
                        overflow: "auto",
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      {article.article_markdown || ""}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
