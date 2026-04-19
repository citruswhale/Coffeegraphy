import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCatalog } from "../context/CatalogContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Rewards() {
  const catalog = useCatalog();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const rewards = catalog?.rewards || [];
  const points = (user && typeof user === "object") ? user.points : 0;

  const redeem = async (r) => {
    if (!user || typeof user !== "object") {
      toast.error("Sign in to redeem");
      navigate("/login");
      return;
    }
    if (points < r.cost) {
      toast.error("Not enough points yet");
      return;
    }
    try {
      const { data } = await api.post(`/rewards/redeem/${r.id}`);
      setUser({ ...user, points: points - r.cost });
      toast.success(`Redeemed · code ${data.code}`, { description: "Find it in your dashboard." });
    } catch (e) {
      toast.error(e.response?.data?.detail || "Couldn't redeem");
    }
  };

  return (
    <div className="min-h-screen grain bg-ombre">
      <Navbar />
      <div className="pt-36 max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-8">
            <p className="chip">Rewards</p>
            <h1 className="mt-6 font-serif text-6xl md:text-7xl leading-[0.95]">
              Sip, earn, <em className="text-[#C7A36A]">redeem</em>.
            </h1>
            <p className="mt-6 max-w-xl text-[#A3978F] leading-relaxed">
              Every dollar you spend earns 10 points. Trade them for the things you love — on the house.
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#A3978F]">Your balance</p>
            <p data-testid="rewards-points" className="font-serif text-6xl text-[#C7A36A]">{points}</p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((r) => {
            const enough = points >= r.cost;
            return (
              <article key={r.id} data-testid={`reward-${r.id}`} className="surface p-7 hover-lift">
                <div className="flex items-center justify-between">
                  <Gift size={22} className="text-[#C7A36A]" />
                  <span className="font-mono text-xs px-2 py-1 border border-[#C7A36A]/40 text-[#C7A36A]">
                    {r.cost} pts
                  </span>
                </div>
                <h3 className="mt-6 font-serif text-2xl leading-tight">{r.name}</h3>
                <p className="mt-2 text-sm text-[#A3978F] leading-relaxed">{r.desc}</p>
                <button
                  data-testid={`reward-redeem-${r.id}`}
                  onClick={() => redeem(r)}
                  disabled={!enough}
                  className="btn-primary mt-8 w-full justify-center"
                >
                  {enough ? "Redeem" : `Need ${r.cost - points} more`}
                </button>
              </article>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
