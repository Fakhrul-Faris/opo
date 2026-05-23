import React, { useState, useEffect } from "react";
import axios from "axios";

const AIHub = () => {
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState("");
  const [configuredProvider, setConfiguredProvider] = useState("");
  const [model, setModel] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConfiguredProvider(res.data.ai_provider || "claude");
      } catch (err) {
        console.error("Failed to load AI settings", err);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/ai/execute",
        {
          prompt,
          provider: provider || undefined,
          model: model || undefined,
          temperature,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOutput(res.data.output || "No response received.");
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to execute AI request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">AI Hub</h2>
        <p className="text-muted mt-2">
          Send a prompt to the configured AI provider and get a contextual response from the backend.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-muted mb-2">Configured Provider</label>
            <input
              type="text"
              value={settingsLoading ? "Loading..." : configuredProvider || "claude"}
              readOnly
              className="input bg-slate-900"
            />
          </div>
          <div>
            <label className="block text-muted mb-2">Override Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="input"
            >
              <option value="">Use configured provider</option>
              <option value="openai">OpenAI</option>
              <option value="claude">Anthropic Claude</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-muted mb-2">Optional Model</label>
            <input
              type="text"
              placeholder="gpt-4o-mini or claude-3.5-neo"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-muted mb-2">Temperature</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-muted">{temperature.toFixed(2)}</p>
          </div>
        </div>

        <div>
          <label className="block text-muted mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask the AI to generate a campaign idea, summarize performance, or analyze a strategy."
            rows={8}
            className="input"
            style={{ resize: "vertical" }}
            required
          />
        </div>

        <button type="submit" className="btn-primary max-w-sm">
          {loading ? "Running AI..." : "Run AI Prompt"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {output && (
        <div className="glass-card mt-6">
          <h3 className="font-semibold text-white mb-2">AI Output</h3>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }} className="text-muted">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AIHub;
