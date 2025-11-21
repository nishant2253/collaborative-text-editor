// server/routes/ai.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authmiddleware");
const {
  grammarCheck,
  enhance,
  summarize,
  complete,
  suggestions,
} = require("../services/aiService");

// All endpoints accept { text: string }
router.post("/grammar-check", auth, async (req, res) => {
  const { text } = req.body;
  const out = await grammarCheck(text || "");
  res.json(out);
});

router.post("/enhance", auth, async (req, res) => {
  const { text } = req.body;
  const out = await enhance(text || "");
  res.json(out);
});

router.post("/summarize", auth, async (req, res) => {
  const { text } = req.body;
  const out = await summarize(text || "");
  res.json(out);
});

router.post("/complete", auth, async (req, res) => {
  const { text } = req.body;
  const out = await complete(text || "");
  res.json(out);
});

router.post("/suggestions", auth, async (req, res) => {
  const { text } = req.body;
  const out = await suggestions(text || "");
  res.json(out);
});

module.exports = router;
