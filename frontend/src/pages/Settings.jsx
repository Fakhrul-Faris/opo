import React, { useState, useEffect } from "react";
import axios from "axios";

const Settings = () => {
  const [provider, setProvider] = useState("claude");
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Fetch current settings on load
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/settings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          setProvider(res.data.ai_provider || "claude");
          setApiKey(res.data.ai_api_key || "");
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    try {
      const token = localStorage.getItem("token");
      await axios.post("/settings", {
        ai_provider: provider,
        ai_api_key: apiKey
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatus("Settings saved successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("Error saving settings.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mt-20">
      <div className="glass-card">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-muted mb-2">AI Provider</label>
            <select 
              value={provider} 
              onChange={(e) => setProvider(e.target.value)}
              className="input"
            >
              <option value="claude">Anthropic Claude</option>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
          <div>
            <label className="block text-muted mb-2">API Key</label>
            <input 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)}
              className="input" 
              placeholder="Enter your API Key"
            />
          </div>
          <button type="submit" className="btn-primary mt-2 max-w-sm">Save Settings</button>
          {status && <p className="text-muted mt-2">{status}</p>}
        </form>
      </div>
    </div>
  );
};

export default Settings;
