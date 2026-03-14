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

export default function ClusterPanel() {
  const [keyword, setKeyword] = useState("");
  const [tone, setTone] = useState("uzman");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cluster, setCluster] = useState(null);

  const rows = useMemo(() => {
    if (!cluster?.cluster_articles?.length) return [];
    return [
      ["keyword", "title", "intent", "slug", "angle"],
      ...cluster.cluster_articles.map((item) => [
        item.keyword || "",
        item.title || "",
        item.intent || "",
        item.slug || "",
        item.angle || "",
      ]),
    ];
  }, [cluster]);

  async function handleGenerate() {
    if (!keyword.trim()) {
      setError("Anahtar kelime gerekli.");
      return;
    }

    setLoading(true);
    setError("");
    setCluster(null);

    try {
      const res = await fetch(`${API_BASE}/api/cluster`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          language: "Türkçe",
          country: "Türkiye",
          tone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Cluster oluşturulamadı.");
      }

      setCluster(data.result);
    } catch (err) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadCsv() {
    if (!rows.length) return;
    const safeKeyword = (cluster?.pillar_keyword || "cluster")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ-]/gi, "");
    downloadCsv(`${safeKeyword}-cluster.csv`, rows);
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
        <h2 style={{ margin: 0, fontSize: 24 }}>Topic Cluster Oluştur</h2>
        <p style={{ marginTop: 8, opacity: 0.8 }}>
          Tek anahtar kelimeden içerik kümeleri oluştur. Böylece pillar + alt
          makale planını tek seferde çıkar.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr auto",
          gap: 12,
          alignItems: "end",
        }}
      >
        <div>
          <label style={{ display: "block", marginBottom: 6 }}>
            Anahtar Kelime
          </label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Örn: seo nedir"
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
          onClick={handleGenerate}
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
          {loading ? "Oluşturuluyor..." : "Cluster Oluştur"}
        </button>
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

      {cluster ? (
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ opacity: 0.7, marginBottom: 4 }}>Pillar Keyword</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>
                {cluster.pillar_keyword}
              </div>
              <div style={{ opacity: 0.8, marginTop: 6 }}>
                {cluster.pillar_title}
              </div>
            </div>

            <button
              onClick={handleDownloadCsv}
              style={{
                height: 42,
                padding: "0 16px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              CSV İndir
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            {cluster.cluster_articles?.map((item, idx) => (
              <div
                key={`${item.slug}-${idx}`}
                style={{
                  padding: 16,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.025)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 17 }}>
                      {item.title}
                    </div>
                    <div style={{ marginTop: 8, opacity: 0.75 }}>
                      <strong>Keyword:</strong> {item.keyword}
                    </div>
                    <div style={{ marginTop: 6, opacity: 0.75 }}>
                      <strong>Intent:</strong> {item.intent}
                    </div>
                    <div style={{ marginTop: 6, opacity: 0.75 }}>
                      <strong>Slug:</strong> {item.slug}
                    </div>
                    <div style={{ marginTop: 6, opacity: 0.75 }}>
                      <strong>Angle:</strong> {item.angle}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      minWidth: 140,
                    }}
                  >
                    <button
                      onClick={() => copyText(item.keyword || "")}
                      style={{
                        height: 38,
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "transparent",
                        color: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      Keyword Kopyala
                    </button>
                    <button
                      onClick={() => copyText(item.title || "")}
                      style={{
                        height: 38,
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "transparent",
                        color: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      Başlık Kopyala
                    </button>
                    <button
                      onClick={() =>
                        copyText(
                          JSON.stringify(
                            {
                              keyword: item.keyword,
                              title: item.title,
                              intent: item.intent,
                              slug: item.slug,
                              angle: item.angle,
                            },
                            null,
                            2
                          )
                        )
                      }
                      style={{
                        height: 38,
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
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
