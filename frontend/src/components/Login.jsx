// src/components/Login.jsx
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const Login = ({ onSuccess }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (pin !== "1234") {
      setError("Invalid PIN");
      setPin("");
      return;
    }

    localStorage.setItem("token", "pin-auth-token");
    onSuccess?.();
  };

  return (
    <div className="glass-card max-w-sm mx-auto mt-20 p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
      {error && <p className="text-red-500 mb-2 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="password"
          inputMode="numeric"
          maxLength="4"
          placeholder="Email"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          required
          className="text-center text-2xl tracking-widest"
        />
        <Input
          type="password"
          placeholder="Password"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
          required
          className="text-center"
          style={{ display: "none" }}
        />
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
};

export default Login;


