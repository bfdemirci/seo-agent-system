function countOccurrences(text, pattern) {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

function calculateSeoScore(result) {
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

  let score = 0;
  const checks = [];

  if (title.trim()) {
    score += 10;
    checks.push({ label: "Başlık", ok: true });
  } else {
    checks.push({ label: "Başlık", ok: false });
  }

  if (seoTitle.trim()) {
    score += 10;
    checks.push({ label: "SEO Başlık", ok: true });
  } else {
    checks.push({ label: "SEO Başlık", ok: false });
  }

  if (metaDescription.trim()) {
    score += 10;
    checks.push({ label: "Meta Açıklama", ok: true });
  } else {
    checks.push({ label: "Meta Açıklama", ok: false });
  }

  if (slug.trim()) {
    score += 5;
    checks.push({ label: "Slug", ok: true });
  } else {
    checks.push({ label: "Slug", ok: false });
  }

  const wordCount = article.trim() ? article.trim().split(/\s+/).length : 0;
  if (wordCount >= 1200) {
    score += 15;
    checks.push({ label: "Kelime Sayısı", ok: true, value: wordCount });
  } else if (wordCount >= 800) {
    score += 8;
    checks.push({ label: "Kelime Sayısı", ok: true, value: wordCount });
  } else {
    checks.push({ label: "Kelime Sayısı", ok: false, value: wordCount });
  }

  const h2Count = countOccurrences(article, /^##\s+/gm);
  const h3Count = countOccurrences(article, /^###\s+/gm);

  if (h2Count >= 4) {
    score += 15;
    checks.push({ label: "H2 Yapısı", ok: true, value: h2Count });
  } else {
    checks.push({ label: "H2 Yapısı", ok: false, value: h2Count });
  }

  if (h3Count >= 2) {
    score += 10;
    checks.push({ label: "H3 Yapısı", ok: true, value: h3Count });
  } else {
    checks.push({ label: "H3 Yapısı", ok: false, value: h3Count });
  }

  if (faqQuestions.length >= 5) {
    score += 10;
    checks.push({ label: "FAQ", ok: true, value: faqQuestions.length });
  } else {
    checks.push({ label: "FAQ", ok: false, value: faqQuestions.length });
  }

  if (internalLinks.length >= 5) {
    score += 10;
    checks.push({ label: "İç Link Önerileri", ok: true, value: internalLinks.length });
  } else {
    checks.push({ label: "İç Link Önerileri", ok: false, value: internalLinks.length });
  }

  if (score > 100) score = 100;

  return {
    score,
    checks
  };
}

module.exports = { calculateSeoScore };
