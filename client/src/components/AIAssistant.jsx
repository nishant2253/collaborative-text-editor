import React, { useState } from "react";
import api from "../services/api";

export default function AIAssistant({ text, setText }) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState("");

  async function callAI(endpoint) {
    setLoading(true);
    setAction(endpoint);

    try {
      const safeText = typeof text === "string" ? text : "";

      const res = await api.post(`/ai/${endpoint}`, { text: safeText });

      const updated =
        res.data.corrected ||
        res.data.summary ||
        res.data.enhanced ||
        res.data.completion ||
        res.data.suggestions?.join("\n") ||
        res.data.result;

      if (typeof updated === "string") {
        setText(updated);
      }
    } catch (err) {
      console.error("AI error", err);
    } finally {
      setLoading(false);
      setAction("");
    }
  }

  return (
    <div className="p-4 bg-white shadow rounded space-y-2">
      <h3 className="font-semibold text-lg">AI Assistant</h3>

      <button
        className="btn w-full"
        disabled={loading}
        onClick={() => callAI("summarize")}
      >
        {loading && action === "summarize" ? "Summarizing..." : "Summarize"}
      </button>

      <button
        className="btn w-full"
        disabled={loading}
        onClick={() => callAI("grammar-check")}
      >
        {loading && action === "grammar-check"
          ? "Checking..."
          : "Grammar Check"}
      </button>

      <button
        className="btn w-full"
        disabled={loading}
        onClick={() => callAI("enhance")}
      >
        {loading && action === "enhance" ? "Enhancing..." : "Enhance Text"}
      </button>

      <button
        className="btn w-full"
        disabled={loading}
        onClick={() => callAI("complete")}
      >
        {loading && action === "complete" ? "Completing..." : "Auto Complete"}
      </button>

      <button
        className="btn w-full"
        disabled={loading}
        onClick={() => callAI("suggestions")}
      >
        {loading && action === "suggestions" ? "Thinking..." : "Suggestions"}
      </button>
    </div>
  );
}
