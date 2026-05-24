import { useEffect, useState } from "react";
import axios from "axios";

const CommunityIntelligence = () => {
  const [leaders, setLeaders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const token = localStorage.getItem("token");
        const [leadersRes, summaryRes] = await Promise.all([
          axios.get("/ketua_arisan", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/ketua_arisan/summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setLeaders(leadersRes.data || []);
        setSummary(summaryRes.data || null);
      } catch (err) {
        console.error(err);
        setError("Unable to load Ketua Arisan intelligence.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, []);

  return (
    <div className="glass-card max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Community Intelligence</h2>
        <p className="text-muted mt-2">
          Track and manage Ketua Arisan community leaders driving referral growth.
        </p>
      </div>

      {loading ? (
        <p className="text-muted text-center py-8">Loading community intelligence...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <>
          {summary && (
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="glass-card p-4 text-center">
                <p className="text-xs uppercase text-muted">Leaders</p>
                <p className="text-2xl font-semibold text-white">{summary.total_leaders}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs uppercase text-muted">Estimated Reach</p>
                <p className="text-2xl font-semibold text-white">{summary.total_reach}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs uppercase text-muted">Referrals</p>
                <p className="text-2xl font-semibold text-white">{summary.total_referrals}</p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-xs uppercase text-muted">Activation / Retention</p>
                <p className="text-2xl font-semibold text-white">
                  {summary.avg_activation_rate}/{summary.avg_retention_rate}
                </p>
              </div>
            </div>
          )}

          <div className="glass-card p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Ketua Arisan Leaders</h3>
              <button className="btn-primary">+ Add Leader</button>
            </div>
            {leaders.length === 0 ? (
              <p className="text-muted">No leaders found. Add your first Ketua Arisan profile.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-muted text-xs uppercase">
                      <th className="p-3">Name</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Community Size</th>
                      <th className="p-3">Referrals</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Last Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaders.map((leader) => (
                      <tr key={leader.id} className="border-b border-white/10">
                        <td className="p-3 text-white">{leader.name}</td>
                        <td className="p-3 text-muted">{leader.location || '-'}</td>
                        <td className="p-3 text-muted">{leader.community_size ?? '-'}</td>
                        <td className="p-3 text-muted">{leader.members_referred ?? '-'}</td>
                        <td className="p-3 text-muted">{leader.status}</td>
                        <td className="p-3 text-muted">{leader.last_contact || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommunityIntelligence;
