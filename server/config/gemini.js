// server/config/gemini.js
const { GoogleGenAI } = require("@google/genai"); // correct package
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function sendToGemini(type, text) {
  const modelName = "gemini-2.5-flash"; // per docs

  const promptMap = {
    "grammar-check": `Fix grammar:\n${text}`,
    summarise: `Summarize:\n${text}`,
    enhance: `Improve writing quality:\n${text}`,
    complete: `Continue writing:\n${text}`,
    suggestions: `Giving writing suggestions:\n${text}`,
  };

  const prompt = promptMap[type] || text;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });
    const output = response.text ?? response.output_text; // depending on SDK version
    return { result: output };
  } catch (err) {
    console.error("Gemini API Error:", err);
    return { error: err.message };
  }
}

module.exports = { sendToGemini };
