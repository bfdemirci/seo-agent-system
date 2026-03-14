import { useMemo, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://seo-agent-system.onrender.com";

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

export default function BulkKeywordPanel() {
  const [text, setText] = useState("");
  const [tone, setTone] = useState("uzman");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);

  const keywords = useMemo(() => {
    return text
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  }, [text]);

  const csvRows = useMemo(() => {
    const rows = [["input_keyword", "pillar_keyword", "pillar_title", "cluster_count"]];
    for (const item of results) {
      rows.push([
        item.input_keyword || "",
        item.result?.pillar_keyword || "",
        item.result?.pillar_title || "",
        item.result?.cluster_articles?.length || 0,
      ]);

      for (const article of item.result?.cluster_articles || []) {
        rows.push([
          "",
          article.keyword || "",
          article.title || "",
          article.intent || "",
          article.slug || "",
          article.angle || "",
        ]);
      }
    }
    return rows;
  }, [results]);

  async function handleGenerateBulk() {
    if (!keywords.length) {
      setError("En az bir anahtar kelime gir.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const collected = [];

      for (const kw of keywords) {
        const res = await fetch(`${API_BASE}/api/cluster`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keyword: kw,
            language: "Türkçe",
            country: "Türkiye",
            tone,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data?.ok) {
          collected.push({
            input_keyword: kw,
            error: data?.error || "Cluster oluşturulamadı.",
            result: null,
          });
        } else {
          collected.push({
            input_keyword: kw,
            error: "",
            result: data.result,
          });
        }

        setResults([...collected]);
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (err) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!results.length) return;
    downloadCsv("bulk-keyword-clusters.csv", csvRows);
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
        <h2 style={{ margin: 0, fontSize: 24 }}>Bulk Keyword Upload</h2>
        <p style={{ marginTop: 8, opacity: 0.8 }}>
          Her satıra bir anahtar kelime yaz. Sistem her biri için topic cluster oluştursun.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr auto auto",
          gap: 12,
          alignItems: "end",
        }}
      >
        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Keyword Listesi</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"seo nedir\nteknik seo\nbacklink nedir"}
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

        <button
          onClick={handleGenerateBulk}
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
          {loading ? "Çalışıyor..." : "Toplu Cluster Oluştur"}
        </button>

        <button
          onClick={handleDownload}
          disabled={!results.length}
          style={{
            height: 46,
            padding: "0 18px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent",
            color: "inherit",
            cursor: !results.length ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          CSV İndir
        </button>
      </div>

      <div style={{ marginTop: 10, opacity: 0.75 }}>
        Toplam keyword: {keywords.length}
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

      {results.length ? (
        <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
          {results.map((item, idx) => (
            <div
              key={`${item.input_keyword}-${idx}`}
              style={{
                padding: 16,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.025)",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 17 }}>{item.input_keyword}</div>

              {item.error ? (
                <div style={{ marginTop: 8, color: "#ff8b8b" }}>{item.error}</div>
              ) : (
                <>
                  <div style={{ marginTop: 8, opacity: 0.8 }}>
                    <strong>Pillar:</strong> {item.result?.pillar_title}
                  </div>
                  <div style={{ marginTop: 6, opacity: 0.8 }}>
                    <strong>Cluster Sayısı:</strong> {item.result?.cluster_articles?.length || 0}
                  </div>

                  <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                    {(item.result?.cluster_articles || []).slice(0, 8).map((article, i) => (
                      <div
                        key={`${article.slug}-${i}`}
                        style={{
                          padding: 10,
                          borderRadius: 10,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{article.title}</div>
                        <div style={{ marginTop: 4, opacity: 0.75, fontSize: 13 }}>
                          {article.keyword} • {article.intent} • {article.slug}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
