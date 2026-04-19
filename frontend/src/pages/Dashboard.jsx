import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Trash2, Repeat, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [orders, setOrders] = useState([]);
  const [saved, setSaved] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const [o, s, r] = await Promise.all([
        api.get("/orders"),
        api.get("/saved-drinks"),
        api.get("/redemptions"),
      ]);
      setOrders(o.data); setSaved(s.data); setRedemptions(r.data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const reorderSaved = (d) => {
    addItem({ name: d.name, price: d.price, quantity: 1, components: d.components });
    toast.success("Added to tray");
    navigate("/checkout");
  };

  const deleteSaved = async (id) => {
    try {
      await api.delete(`/saved-drinks/${id}`);
      setSaved((prev) => prev.filter((d) => d.id !== id));
      toast.success("Removed");
    } catch { toast.error("Couldn't delete"); }
  };

  if (!user || typeof user !== "object") return null;

  return (
    <div className="min-h-screen grain bg-ombre">
      <Navbar />
      <div className="pt-36 max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-7">
            <p className="chip">Your bar</p>
            <h1 className="mt-6 font-serif text-5xl md:text-6xl leading-[0.95]">
              Welcome, <em className="text-[#C7A36A]">{user.name}</em>.
            </h1>
          </div>
          <div className="col-span-12 md:col-span-5 md:text-right">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#A3978F]">Points balance</p>
            <p data-testid="dashboard-points" className="font-serif text-6xl text-[#C7A36A]">{user.points}</p>
            <Link to="/rewards" className="text-[11px] tracking-[0.3em] uppercase text-[#F5F0EB]/80 hover:text-[#C7A36A]">
              Redeem now <ArrowRight size={12} className="inline" />
            </Link>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Saved drinks */}
          <section className="lg:col-span-7 surface p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl">Your saved drinks</h2>
              <Link to="/craft" className="text-[11px] tracking-[0.3em] uppercase text-[#C7A36A]">+ New craft</Link>
            </div>
            <div className="mt-6 divider" />
            {saved.length === 0 && (
              <p className="mt-8 text-[#A3978F] text-sm">
                You haven't saved any drinks yet. <Link to="/craft" className="text-[#C7A36A] underline">Craft one →</Link>
              </p>
            )}
            <ul className="mt-6 space-y-4">
              {saved.map((d) => (
                <li key={d.id} data-testid={`saved-${d.id}`} className="flex items-start justify-between gap-4 py-4 border-b border-[#2C1A12] last:border-0">
                  <div>
                    <h4 className="font-serif text-xl">{d.name}</h4>
                    <p className="mt-1 text-xs text-[#A3978F]">
                      {d.components?.size} · {d.components?.bean} · {d.components?.milk}
                      {d.components?.syrups?.length > 0 && ` · ${d.components.syrups.join(", ")}`}
                      {d.components?.toppings?.length > 0 && ` · ${d.components.toppings.join(", ")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-serif text-lg">${d.price.toFixed(2)}</span>
                    <button data-testid={`saved-reorder-${d.id}`} onClick={() => reorderSaved(d)} title="Reorder"
                            className="btn-ghost !py-1.5 !px-3 !text-[10px]"><Repeat size={12} /></button>
                    <button data-testid={`saved-delete-${d.id}`} onClick={() => deleteSaved(d.id)} title="Delete"
                            className="btn-ghost !py-1.5 !px-3 !text-[10px]"><Trash2 size={12} /></button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Right column */}
          <aside className="lg:col-span-5 space-y-6">
            <div className="surface p-8">
              <h2 className="font-serif text-2xl">Recent orders</h2>
              <div className="mt-4 divider" />
              {orders.length === 0 && (
                <p className="mt-6 text-sm text-[#A3978F]">No orders yet — start with a craft or grab something off the menu.</p>
              )}
              <ul className="mt-4 space-y-4">
                {orders.slice(0, 5).map((o) => (
                  <li key={o.id} data-testid={`order-${o.id}`} className="flex items-start justify-between gap-4 py-3 border-b border-[#2C1A12] last:border-0">
                    <div>
                      <p className="text-xs tracking-widest uppercase text-[#A3978F]">
                        {new Date(o.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {o.items.length} item{o.items.length > 1 ? "s" : ""}
                      </p>
                      <p className="mt-1 font-serif text-base">
                        {o.items.slice(0, 2).map((i) => i.name).join(" · ")}
                        {o.items.length > 2 && " + more"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-serif text-lg">${o.total.toFixed(2)}</p>
                      <p className="text-[10px] tracking-widest uppercase text-[#C7A36A]">+{o.points_earned} pts</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface p-8">
              <h2 className="font-serif text-2xl">Redemption codes</h2>
              <div className="mt-4 divider" />
              {redemptions.length === 0 && (
                <p className="mt-6 text-sm text-[#A3978F]">No redemptions yet.</p>
              )}
              <ul className="mt-4 space-y-4">
                {redemptions.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-4 py-3 border-b border-[#2C1A12] last:border-0">
                    <div>
                      <p className="font-serif">{r.reward_name}</p>
                      <p className="text-[10px] tracking-widest uppercase text-[#A3978F]">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="font-mono text-xs px-3 py-1.5 border border-[#C7A36A]/40 text-[#C7A36A]">{r.code}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
