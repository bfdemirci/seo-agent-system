const fs = require("fs");

function escapeCSV(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

function exportToCSV(data) {
  const headers = [
    "title",
    "seo_title",
    "meta_description",
    "slug",
    "article",
    "faq_questions",
    "internal_links",
    "suggested_internal_links",
    "pillar_topic",
    "cluster_articles",
    "supporting_articles",
    "publishing_priority",
    "primary_keywords",
    "secondary_keywords",
    "tracking_frequency",
    "success_metrics",
    "refresh_triggers"
  ];

  const row = [
    data.writer?.title || "",
    data.seo?.seo_title || "",
    data.seo?.meta_description || "",
    data.seo?.slug || "",
    data.editor?.revised_article_markdown || "",
    (data.seo?.faq_questions || []).join(" | "),
    (data.seo?.internal_link_suggestions || []).join(" | "),
    (data.internalLinking?.suggested_internal_links || [])
      .map(link => `${link.anchor_text} -> ${link.target_topic}`)
      .join(" | "),
    data.topicalMap?.pillar_topic || "",
    (data.topicalMap?.cluster_articles || []).join(" | "),
    (data.topicalMap?.supporting_articles || []).join(" | "),
    (data.topicalMap?.publishing_priority || []).join(" | "),
    (data.rankTracker?.primary_keywords || []).join(" | "),
    (data.rankTracker?.secondary_keywords || []).join(" | "),
    data.rankTracker?.tracking_frequency || "",
    (data.rankTracker?.success_metrics || []).join(" | "),
    (data.rankTracker?.refresh_triggers || []).join(" | ")
  ];

  const csv =
    headers.map(escapeCSV).join(",") + "\n" +
    row.map(escapeCSV).join(",");

  fs.writeFileSync("output.csv", csv, "utf8");
  console.log("CSV oluşturuldu: output.csv");
}

module.exports = { exportToCSV };
