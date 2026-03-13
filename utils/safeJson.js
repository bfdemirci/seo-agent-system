const { parseJsonResponse } = require("./parseJsonResponse");

function safeJson(response, fallback = {}, label = "JSON") {
  try {
    return parseJsonResponse(response, label);
  } catch (err) {
    console.log(`⚠️ ${label} parse başarısız. Fallback kullanılıyor.`);
    return fallback;
  }
}

module.exports = { safeJson };
