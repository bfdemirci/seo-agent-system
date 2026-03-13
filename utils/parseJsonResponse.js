function extractFirstJsonBlock(str) {
  const firstBrace = str.indexOf("{");
  const firstBracket = str.indexOf("[");

  let start = -1;
  let openChar = "";
  let closeChar = "";

  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error("JSON başlangıcı bulunamadı");
  }

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
    openChar = "{";
    closeChar = "}";
  } else {
    start = firstBracket;
    openChar = "[";
    closeChar = "]";
  }

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < str.length; i++) {
    const ch = str[i];

    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }

      if (ch === "\\") {
        escape = true;
        continue;
      }

      if (ch === '"') {
        inString = false;
        continue;
      }

      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === openChar) depth++;
    if (ch === closeChar) depth--;

    if (depth === 0) {
      return str.slice(start, i + 1);
    }
  }

  throw new Error("JSON bloğu tamamlanamadı");
}

function sanitizeJsonString(str) {
  return String(str || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function parseJsonResponse(response, label = "JSON") {
  const clean = sanitizeJsonString(response);

  try {
    return JSON.parse(clean);
  } catch {
    try {
      const extracted = extractFirstJsonBlock(clean);
      return JSON.parse(extracted);
    } catch (err) {
      console.log(`${label} parse hatası:`);
      console.log(clean);
      throw err;
    }
  }
}

module.exports = { parseJsonResponse };
