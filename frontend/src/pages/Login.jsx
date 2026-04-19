import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome back");
      const to = location.state?.from || "/dashboard";
      navigate(to);
    } else {
      setError(res.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grain bg-ombre">
      <Navbar />
      <div className="pt-40 max-w-md mx-auto px-6 pb-24">
        <p className="chip">Welcome back</p>
        <h1 className="mt-6 font-serif text-5xl">Sign in</h1>
        <form onSubmit={submit} className="mt-10 space-y-4">
          <input data-testid="login-email" className="input-dark" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input data-testid="login-password" type="password" className="input-dark" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          {error && <p data-testid="login-error" className="text-sm text-[#B35127]">{error}</p>}
          <button data-testid="login-submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-8 text-sm text-[#A3978F]">
          New to Ember &amp; Oak? <Link to="/register" className="text-[#C7A36A] underline underline-offset-4">Join here</Link>.
        </p>
        <div className="mt-10 surface p-5">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C7A36A]">Demo account</p>
          <p className="mt-2 text-xs text-[#A3978F]">demo@coffeegraphy.com · demo1234</p>
        </div>
      </div>
    </div>
  );
}
