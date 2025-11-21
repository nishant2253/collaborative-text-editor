// server/services/aiService.js
const { sendToGemini } = require("../config/gemini");

const grammarCheck = async (text) => {
  return sendToGemini("grammar", text);
};

const enhance = async (text) => {
  return sendToGemini("enhance", text);
};

const summarize = async (text) => {
  return sendToGemini("summarize", text);
};

const complete = async (text) => {
  return sendToGemini("complete", text);
};

const suggestions = async (text) => {
  return sendToGemini("suggestions", text);
};

module.exports = { grammarCheck, enhance, summarize, complete, suggestions };
