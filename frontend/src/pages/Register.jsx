import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await register(email, password, name);
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome to Coffeegraphy", { description: "100 bonus points added." });
      navigate("/dashboard");
    } else {
      setError(res.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen grain bg-ombre">
      <Navbar />
      <div className="pt-40 max-w-md mx-auto px-6 pb-24">
        <p className="chip">Become a member</p>
        <h1 className="mt-6 font-serif text-5xl">Join Coffeegraphy</h1>
        <p className="mt-3 text-[#A3978F] text-sm">100 welcome points on signup.</p>
        <form onSubmit={submit} className="mt-10 space-y-4">
          <input data-testid="register-name" className="input-dark" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input data-testid="register-email" className="input-dark" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <input data-testid="register-password" type="password" className="input-dark" placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={6} required />
          {error && <p data-testid="register-error" className="text-sm text-[#B35127]">{error}</p>}
          <button data-testid="register-submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Brewing your account…" : "Create account"}
          </button>
        </form>
        <p className="mt-8 text-sm text-[#A3978F]">
          Already a member? <Link to="/login" className="text-[#C7A36A] underline underline-offset-4">Sign in</Link>.
        </p>
      </div>
    </div>
  );
}
