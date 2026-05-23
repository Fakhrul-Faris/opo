import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Command Center" },
    { path: "/campaigns", label: "Campaign Manager" },
    { path: "/content", label: "Content Bank" },
    { path: "/referrals", label: "Referral Tracker" },
    { path: "/ai", label: "AI Hub" },
    { path: "/settings", label: "Settings" }
  ];

  return (
    <nav className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', height: 'calc(100vh - 2rem)', width: '16rem', position: 'fixed', margin: '1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center', color: 'var(--primary)' }}>
        Opo Portal
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
              background: location.pathname === item.path ? 'var(--primary)' : 'transparent',
              color: location.pathname === item.path ? '#fff' : 'var(--text-muted)',
              boxShadow: location.pathname === item.path ? '0 0 15px rgba(59,130,246,0.5)' : 'none'
            }}
            onMouseOver={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseOut={(e) => {
              if (location.pathname !== item.path) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            U
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>User</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
