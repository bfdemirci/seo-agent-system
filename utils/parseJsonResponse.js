function parseJsonResponse(response, label = "JSON") {
  const clean = String(response || "")
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(clean);
  } catch (err) {
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    const firstBracket = clean.indexOf("[");
    const lastBracket = clean.lastIndexOf("]");

    let candidate = clean;

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      candidate = clean.slice(firstBrace, lastBrace + 1);
    } else if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      candidate = clean.slice(firstBracket, lastBracket + 1);
    }

    try {
      return JSON.parse(candidate);
    } catch (err2) {
      console.log(`${label} parse hatası:`);
      console.log(clean);
      throw err2;
    }
  }
}

module.exports = { parseJsonResponse };
