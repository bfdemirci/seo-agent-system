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

function getGeneratedArticle(result) {
  return (
    result?.finalizer?.final_article_markdown ||
    result?.editor?.revised_article_markdown ||
    result?.writer?.article_markdown ||
    ""
  );
}

export default function ClusterPanel() {
  const [keyword, setKeyword] = useState("");
  const [tone, setTone] = useState("uzman");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cluster, setCluster] = useState(null);

  const [generateLoadingSlug, setGenerateLoadingSlug] = useState("");
  const [generatedMap, setGeneratedMap] = useState({});
  const [generateErrorMap, setGenerateErrorMap] = useState({});

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

  async function handleGenerateCluster() {
    if (!keyword.trim()) {
      setError("Anahtar kelime gerekli.");
      return;
    }

    setLoading(true);
    setError("");
    setCluster(null);
    setGeneratedMap({});
    setGenerateErrorMap({});

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

  async function handleGenerateArticle(item) {
    const key = item.slug || item.keyword || item.title;
    setGenerateLoadingSlug(key);
    setGenerateErrorMap((prev) => ({ ...prev, [key]: "" }));

    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: item.keyword,
          topic: item.title,
          tone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Makale üretilemedi.");
      }

      setGeneratedMap((prev) => ({
        ...prev,
        [key]: data.result,
      }));
    } catch (err) {
      setGenerateErrorMap((prev) => ({
        ...prev,
        [key]: err.message || "Makale üretilemedi.",
      }));
    } finally {
      setGenerateLoadingSlug("");
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
          Tek anahtar kelimeden içerik kümeleri oluştur. İstersen listedeki her
          başlık için direkt makale de üret.
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
          onClick={handleGenerateCluster}
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
            {cluster.cluster_articles?.map((item, idx) => {
              const key = item.slug || item.keyword || item.title || String(idx);
              const generated = generatedMap[key];
              const generateError = generateErrorMap[key];
              const generatedArticle = getGeneratedArticle(generated);

              return (
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
                        minWidth: 160,
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
                        onClick={() => handleGenerateArticle(item)}
                        disabled={generateLoadingSlug === key}
                        style={{
                          height: 38,
                          borderRadius: 10,
                          border: "none",
                          background: "rgba(255,255,255,0.12)",
                          color: "inherit",
                          cursor:
                            generateLoadingSlug === key ? "not-allowed" : "pointer",
                          fontWeight: 700,
                        }}
                      >
                        {generateLoadingSlug === key
                          ? "Üretiliyor..."
                          : "Makale Üret"}
                      </button>
                    </div>
                  </div>

                  {generateError ? (
                    <div
                      style={{
                        marginTop: 14,
                        padding: 12,
                        borderRadius: 12,
                        background: "rgba(255,0,0,0.08)",
                        border: "1px solid rgba(255,0,0,0.18)",
                      }}
                    >
                      {generateError}
                    </div>
                  ) : null}

                  {generated ? (
                    <div
                      style={{
                        marginTop: 16,
                        padding: 16,
                        borderRadius: 14,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(0,0,0,0.12)",
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: 18 }}>
                        {generated?.writer?.title || item.title}
                      </div>

                      <div style={{ marginTop: 10, opacity: 0.85 }}>
                        <strong>SEO Başlık:</strong>{" "}
                        {generated?.seo?.seo_title || "-"}
                      </div>
                      <div style={{ marginTop: 8, opacity: 0.85 }}>
                        <strong>Meta:</strong>{" "}
                        {generated?.seo?.meta_description || "-"}
                      </div>
                      <div style={{ marginTop: 8, opacity: 0.85 }}>
                        <strong>Slug:</strong> {generated?.seo?.slug || "-"}
                      </div>

                      <div style={{ marginTop: 16, fontWeight: 700 }}>
                        Makale Önizleme
                      </div>
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          marginTop: 10,
                          padding: 14,
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          maxHeight: 340,
                          overflow: "auto",
                          fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          fontSize: 13,
                          lineHeight: 1.55,
                        }}
                      >
                        {generatedArticle}
                      </pre>

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexWrap: "wrap",
                          marginTop: 12,
                        }}
                      >
                        <button
                          onClick={() => copyText(generatedArticle)}
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
                              JSON.stringify(
                                {
                                  writer: generated?.writer || {},
                                  editor: generated?.editor || {},
                                  finalizer: generated?.finalizer || {},
                                  seo: generated?.seo || {},
                                },
                                null,
                                2
                              )
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
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
