import { useState } from "react";
import axios from "axios";

const Signup = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const resp = await axios.post("/auth/signup", { email, password });
      localStorage.setItem("token", resp.data.access_token);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div className="glass-card max-w-sm mx-auto mt-20 p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>
      {error && <p className="text-red-500 mb-2 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
        />
        <button type="submit" className="btn-primary">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;

