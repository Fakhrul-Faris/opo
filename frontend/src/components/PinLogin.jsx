import React, { useState } from "react";

const PIN_VALUE = "1234";

const PinLogin = ({ onSuccess }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (pin !== PIN_VALUE) {
      setError("Invalid PIN");
      setPin("");
      return;
    }

    // Keep compatibility with existing auth checks.
    // The backend endpoints still require a Bearer token; for PIN-only demo,
    // we treat the PIN-auth session as a local token.
    localStorage.setItem("token", "pin-auth-token");
    onSuccess?.();
  };

  return (
    <div className="glass-card max-w-sm mx-auto mt-20 p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
      <p className="text-muted mb-4 text-center">Enter your 4-digit PIN</p>

      {error && <p className="text-red-500 mb-2 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          inputMode="numeric"
          maxLength="4"
          placeholder="4-digit PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          required
          className="input text-center text-2xl tracking-widest"
        />

        <button type="submit" className="btn-primary">Login</button>

        <div className="text-center mt-2 text-sm text-muted">
          Demo PIN: <span className="text-white">1234</span>
        </div>
      </form>
    </div>
  );
};

export default PinLogin;

