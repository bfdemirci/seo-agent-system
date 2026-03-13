require("dotenv").config();
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function callClaude({ system, user, maxTokens = 1000 }) {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system,
    messages: [
      {
        role: "user",
        content: user,
      },
    ],
  });

  const textBlocks = [];
  for (const block of message.content) {
    if (block.type === "text") textBlocks.push(block.text);
  }

  return textBlocks.join("\n");
}

module.exports = { callClaude };
