import { useEffect, useState } from "react";
import axios from "axios";

const ReferralTracker = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/referrals", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!cancelled) setReferrals(res.data);
      } catch (err) {
        console.error("Failed to fetch referrals", err);
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
        <h2 className="text-2xl font-bold text-white">Referral Tracker</h2>
        <button className="btn-primary">+ Add Source</button>
      </div>

      {loading ? (
        <p className="text-muted text-center py-8">Loading referral stats...</p>
      ) : referrals.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/20 rounded-lg">
          <p className="text-muted mb-4">No referral sources found.</p>
          <button className="btn-primary">Add Referral Source</button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-muted">
                <th className="p-3 font-medium">Source</th>
                <th className="p-3 font-medium text-right">Clicks</th>
                <th className="p-3 font-medium text-right">Conversions</th>
                <th className="p-3 font-medium text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((ref) => {
                const cvr = ref.clicks > 0 ? ((ref.conversions / ref.clicks) * 100).toFixed(1) : 0;
                return (
                  <tr key={ref.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 font-medium text-white">{ref.source}</td>
                    <td className="p-3 text-right font-mono">{ref.clicks}</td>
                    <td className="p-3 text-right font-mono text-green-400">{ref.conversions}</td>
                    <td className="p-3 text-right font-mono text-secondary">{cvr}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReferralTracker;
