import { useEffect, useState } from "react";
import axios from "axios";

const ContentBank = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/content", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!cancelled) setAssets(res.data);
      } catch (err) {
        console.error("Failed to fetch content assets", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="glass-card max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Content Bank</h2>
        <div className="flex gap-3">
          <input type="text" placeholder="Search content..." className="input max-w-xs" />
          <button className="btn-primary">+ New Content</button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted text-center py-8">Loading content assets...</p>
      ) : assets.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/20 rounded-lg">
          <p className="text-muted mb-4">No content assets found.</p>
          <button className="btn-primary">Generate Content</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {assets.map((asset) => (
            <div key={asset.id} className="glass-card flex flex-col gap-3" style={{ padding: '1.25rem' }}>
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">{asset.platform}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                  asset.status === 'published' ? 'bg-green-500/20 text-green-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {asset.status.toUpperCase()}
                </span>
              </div>
              
              <h3 className="font-bold text-lg text-white line-clamp-2" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {asset.title}
              </h3>
              
              <p className="text-sm text-muted line-clamp-3" style={{ WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {asset.body}
              </p>
              
              <div className="mt-auto pt-3 border-t border-white/10 flex justify-between items-center text-xs text-muted">
                <span>{asset.type} • {asset.theme}</span>
                <button className="text-primary hover:text-primary-hover font-medium">Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentBank;
