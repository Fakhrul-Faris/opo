import React, { useState, useEffect } from "react";
import axios from "axios";

const AIAgentsHub = () => {
  const [configuredProvider, setConfiguredProvider] = useState("claude");
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [agents, setAgents] = useState([
    {
      id: "content-analyzer",
      name: "Content Analyzer",
      description: "Analyzes content performance and suggests improvements",
      type: "analyzer",
      status: "active",
    },
    {
      id: "campaign-optimizer",
      name: "Campaign Optimizer",
      description: "Optimizes campaign targeting and budget allocation",
      type: "optimizer",
      status: "active",
    },
    {
      id: "trend-detector",
      name: "Trend Detector",
      description: "Identifies emerging trends and viral opportunities",
      type: "detector",
      status: "active",
    },
    {
      id: "compliance-checker",
      name: "Compliance Checker",
      description: "Validates campaigns against compliance requirements",
      type: "validator",
      status: "active",
    },
  ]);

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentInput, setAgentInput] = useState("");
  const [agentOutput, setAgentOutput] = useState("");
  const [loading, setLoading] = useState(false);

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

  const runAgent = async (agentId) => {
    if (!agentInput.trim()) return;
    
    setLoading(true);
    setAgentOutput("");

    try {
      const token = localStorage.getItem("token");
      const agent = agents.find((a) => a.id === agentId);

      const res = await axios.post(
        "/ai/execute",
        {
          prompt: `You are a ${agent.name}. Your role is to ${agent.description.toLowerCase()}.\n\nUser request: ${agentInput}`,
          temperature: 0.6,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAgentOutput(res.data.output);
    } catch (err) {
      setAgentOutput(`Error: ${err.response?.data?.detail || "Failed to run agent"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">AI Agents Hub</h2>
        <p className="text-muted mt-2">
          Deploy specialized AI agents to analyze content, optimize campaigns, and detect trends.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Agent Selection */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Available Agents</h3>
          <div className="space-y-3">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`glass-card p-4 text-left transition ${
                  selectedAgent?.id === agent.id
                    ? "ring-2 ring-primary"
                    : "hover:ring-1 hover:ring-primary"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white">{agent.name}</p>
                    <p className="text-xs text-muted mt-1">{agent.description}</p>
                  </div>
                  <span
                    className="text-xs font-mono text-primary"
                    style={{
                      background: "rgba(59, 130, 246, 0.2)",
                      padding: "2px 6px",
                      borderRadius: "3px",
                    }}
                  >
                    {agent.type}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Agent Execution */}
        <div>
          {selectedAgent ? (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Run: {selectedAgent.name}
              </h3>
              <div className="space-y-4">
                <textarea
                  value={agentInput}
                  onChange={(e) => setAgentInput(e.target.value)}
                  placeholder={`Describe your request for ${selectedAgent.name}...`}
                  rows={4}
                  className="input"
                />
                <button
                  onClick={() => runAgent(selectedAgent.id)}
                  className="btn-primary w-full"
                  disabled={loading || !agentInput.trim()}
                >
                  {loading ? "Running..." : "Execute Agent"}
                </button>

                {agentOutput && (
                  <div className="glass-card p-4 mt-4">
                    <p className="text-xs text-muted mb-2">Agent Response:</p>
                    <div className="bg-slate-900 p-3 rounded border border-slate-700">
                      <p className="text-white text-sm whitespace-pre-wrap">{agentOutput}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="text-xs btn-primary">Save Report</button>
                      <button className="text-xs btn-primary" style={{ background: "var(--secondary)" }}>
                        Export
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-muted">Select an agent from the left to begin</p>
            </div>
          )}
          {settingsLoading && (
            <p className="text-xs text-muted mt-4">Loading AI configuration...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAgentsHub;
