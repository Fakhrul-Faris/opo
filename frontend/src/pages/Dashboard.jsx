import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ campaigns: 0, content: 0, referrals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const [campRes, contRes, refRes] = await Promise.all([
          axios.get("/campaigns", { headers }),
          axios.get("/content", { headers }),
          axios.get("/referrals", { headers })
        ]);
        
        setStats({
          campaigns: campRes.data.length || 0,
          content: contRes.data.length || 0,
          referrals: refRes.data.reduce((acc, curr) => acc + curr.clicks, 0) || 0
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Command Center
          </h1>
          <p className="text-muted mt-1">Welcome back to the Opo Marketing Portal.</p>
        </div>
        <button onClick={handleLogout} className="btn-primary" style={{ background: "hsl(0, 80%, 60%)" }}>
          Logout
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading metrics...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card flex flex-col justify-between" style={{ minHeight: '150px' }}>
            <h3 className="font-semibold text-muted text-lg">Active Campaigns</h3>
            <p className="text-5xl font-bold text-white mt-4">{stats.campaigns}</p>
            <Link to="/campaigns" className="text-primary hover:text-primary-hover text-sm mt-4 inline-block">
              View all campaigns →
            </Link>
          </div>
          
          <div className="glass-card flex flex-col justify-between" style={{ minHeight: '150px' }}>
            <h3 className="font-semibold text-muted text-lg">Content Assets</h3>
            <p className="text-5xl font-bold text-white mt-4">{stats.content}</p>
            <Link to="/content" className="text-primary hover:text-primary-hover text-sm mt-4 inline-block">
              Manage content bank →
            </Link>
          </div>
          
          <div className="glass-card flex flex-col justify-between" style={{ minHeight: '150px' }}>
            <h3 className="font-semibold text-muted text-lg">Total Referral Clicks</h3>
            <p className="text-5xl font-bold text-white mt-4">{stats.referrals}</p>
            <Link to="/referrals" className="text-primary hover:text-primary-hover text-sm mt-4 inline-block">
              View referral tracker →
            </Link>
          </div>
          <div className="glass-card flex flex-col justify-between" style={{ minHeight: '150px' }}>
            <h3 className="font-semibold text-muted text-lg">AI Agent</h3>
            <p className="text-5xl font-bold text-white mt-4">Prompt-driven insights</p>
            <Link to="/ai" className="text-primary hover:text-primary-hover text-sm mt-4 inline-block">
              Open AI Hub →
            </Link>
          </div>
        </div>
      )}
      
      <div className="mt-8 glass-card">
        <h2 className="text-xl font-bold mb-4">System Status</h2>
        <div className="flex items-center gap-2 text-green-400">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span>All APIs Operational</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
