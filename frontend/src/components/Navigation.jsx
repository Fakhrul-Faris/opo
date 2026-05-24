import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Command Center" },
    { path: "/campaigns", label: "Campaign Manager" },
    { path: "/content", label: "Content Bank" },
    { path: "/referrals", label: "Referral Tracker" },
    { path: "/calendar", label: "Calendar" },
    { path: "/generator", label: "Content Generator" },
    { path: "/agents", label: "AI Agents" },
    { path: "/community", label: "Community Intelligence" },
    { path: "/ai", label: "AI Hub" },
    { path: "/settings", label: "Settings" }
  ];

  return (
    <nav
      className="glass-card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        padding: "1rem",
        height: "calc(100vh - 2rem)",
        width: "16rem",
        position: "fixed",
        margin: "1rem",
      }}
    >
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: "2rem",
          textAlign: "center",
          color: "var(--primary)",
        }}
      >
        Opo Portal
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={[
                "rounded-lg px-4 py-3 transition-all duration-200 no-underline text-sm",
                isActive
                  ? "bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  : "bg-transparent text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.08)] hover:text-white",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "auto",
          paddingTop: "1rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "50%",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            U
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>User</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Admin</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
