import React, { useState } from "react";

const PinAuthModal = ({ onVerify }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real scenario, this might check against a locally encrypted hash or backend endpoint.
    // For now, we'll hardcode a dummy PIN "1234" for the sake of the demo.
    if (pin === "1234") {
      setError("");
      onVerify();
    } else {
      setError("Invalid PIN");
      setPin("");
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
    }}>
      <div className="glass-card max-w-sm w-full p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Session Locked</h2>
        <p className="text-muted mb-4">Please enter your PIN to continue.</p>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            maxLength="4"
            placeholder="4-digit PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
            required
            className="input text-center text-2xl tracking-widest"
          />
          <button type="submit" className="btn-primary">Unlock</button>
        </form>
      </div>
    </div>
  );
};

export default PinAuthModal;
