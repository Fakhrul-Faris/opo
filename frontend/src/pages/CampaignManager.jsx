import { useEffect, useState } from "react";
import axios from "axios";

const CampaignManager = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/campaigns", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!cancelled) setCampaigns(res.data);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="glass-card max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Campaign Manager</h2>
        <button className="btn-primary">+ New Campaign</button>
      </div>

      {loading ? (
        <p className="text-muted text-center py-8">Loading campaigns...</p>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/20 rounded-lg">
          <p className="text-muted mb-4">No campaigns found.</p>
          <button className="btn-primary">Create Your First Campaign</button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-muted">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Objective</th>
                <th className="p-3 font-medium">Channel</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Date Range</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp) => (
                <tr key={camp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3 font-medium text-white">{camp.name}</td>
                  <td className="p-3 text-muted">{camp.objective}</td>
                  <td className="p-3 text-muted">{camp.channel}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      camp.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      camp.status === 'draft' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {camp.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-muted text-sm">
                    {camp.start_date} {camp.end_date ? `— ${camp.end_date}` : ''}
                  </td>
                  <td className="p-3 text-right">
                    <button className="text-primary hover:text-primary-hover text-sm font-medium mr-3">Edit</button>
                    <button className="text-red-400 hover:text-red-300 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;
