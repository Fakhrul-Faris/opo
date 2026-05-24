import { useState, useEffect } from "react";
import axios from "axios";

const ContentGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [campaign, setCampaign] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [campaignsFetching, setCampaignsFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/campaigns", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCampaigns(res.data || []);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
      } finally {
        setCampaignsFetching(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setGeneratedContent("");

    try {
      const token = localStorage.getItem("token");
      const context = campaign 
        ? `Generate content for campaign: ${campaigns.find(c => c.id === campaign)?.name}` 
        : "Generate social media content";
      
      const res = await axios.post(
        "/ai/execute",
        {
          prompt: `${context}\nPlatform: ${platform}\nTopic: ${prompt}`,
          temperature: 0.8,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGeneratedContent(res.data.output);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Content Generator</h2>
        <p className="text-muted mt-2">
          Use AI to generate social media content ideas and copy for your campaigns.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-muted mb-2">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="input"
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="twitter">Twitter/X</option>
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
              <option value="email">Email</option>
            </select>
          </div>

          <div>
            <label className="block text-muted mb-2">Campaign (Optional)</label>
            <select
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="input"
              disabled={campaignsFetching}
            >
              <option value="">Select a campaign...</option>
              {campaigns.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-muted mb-2">Content Brief / Topic</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Summer sale announcement' or 'Benefits of our new feature'"
            rows={6}
            className="input"
            required
          />
        </div>

        <button type="submit" className="btn-primary max-w-sm" disabled={loading || campaignsFetching}>
          {loading ? "Generating..." : "Generate Content"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {generatedContent && (
        <div className="glass-card mt-6">
          <h3 className="font-semibold text-white mb-4">Generated Content</h3>
          <div className="bg-slate-900 p-4 rounded border border-slate-700">
            <p className="text-white whitespace-pre-wrap">{generatedContent}</p>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="btn-primary">Save as Draft</button>
            <button className="btn-primary" style={{ background: "var(--secondary)" }}>
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
