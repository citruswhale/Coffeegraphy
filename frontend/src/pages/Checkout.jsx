import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useCatalog } from "../context/CatalogContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Trash2, Lock, CheckCircle2 } from "lucide-react";

export default function Checkout() {
  const { items, removeItem, total, pointsEarned, storeId, setStoreId, clear } = useCart();
  const catalog = useCatalog();
  const { user, refreshMe } = useAuth();
  const navigate = useNavigate();

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [placing, setPlacing] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const stores = catalog?.stores || [];
  const store = stores.find((s) => s.id === storeId);

  // Auto-select first store if none chosen yet, once catalog loads
  useEffect(() => {
    if (!storeId && stores.length > 0) setStoreId(stores[0].id);
  }, [stores, storeId, setStoreId]);

  const canPlace = items.length > 0 && cardName && cardNumber.length >= 12 && cardExp && cardCvc && storeId;

  const place = async () => {
    if (!user || typeof user !== "object") {
      toast.error("Sign in to place your order");
      navigate("/login");
      return;
    }
    if (items.length === 0) { toast.error("Your tray is empty"); return; }
    if (!storeId) { toast.error("Choose a pickup store"); return; }
    if (!cardName || cardNumber.length < 12 || !cardExp || !cardCvc) {
      toast.error("Complete your payment details"); return;
    }
    setPlacing(true);
    try {
      const last4 = cardNumber.replace(/\s+/g, "").slice(-4);
      const { data } = await api.post("/orders", {
        store_id: storeId,
        items: items.map((i) => ({ name: i.name, price: i.price, components: i.components, product_id: i.product_id, quantity: i.quantity || 1 })),
        payment: { card_name: cardName, card_last4: last4 },
      });
      setConfirmed(data);
      clear();
      await refreshMe();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Couldn't place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen grain bg-ombre">
        <Navbar />
        <div className="pt-40 max-w-3xl mx-auto px-6 lg:px-10 pb-24 text-center">
          <CheckCircle2 className="mx-auto text-[#C7A36A]" size={56} />
          <h1 className="mt-6 font-serif text-5xl">Your cup is <em className="text-[#C7A36A]">brewing</em>.</h1>
          <p className="mt-4 text-[#A3978F]">Order <span className="font-mono text-[#F5F0EB]">#{confirmed.id.slice(-8).toUpperCase()}</span> · {store?.name}</p>
          <div className="mt-10 surface p-8 text-left">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#C7A36A]">Your receipt</p>
            <ul className="mt-4 divide-y divide-[#2C1A12]">
              {confirmed.items.map((i, k) => (
                <li key={k} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif">{i.name}</p>
                    {i.components && <p className="text-xs text-[#A3978F] mt-1">{i.components.size} · {i.components.bean} · {i.components.milk}</p>}
                  </div>
                  <span className="font-serif">${i.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-[#2C1A12] flex justify-between">
              <div>
                <p className="text-xs tracking-widest uppercase text-[#A3978F]">Total paid</p>
                <p className="font-serif text-4xl">${confirmed.total.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs tracking-widest uppercase text-[#A3978F]">Points earned</p>
                <p className="font-serif text-4xl text-[#C7A36A]">+{confirmed.points_earned}</p>
              </div>
            </div>
          </div>
          <div className="mt-10 flex justify-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="btn-primary">See dashboard</button>
            <button onClick={() => navigate("/craft")} className="btn-ghost">Craft another</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen grain bg-ombre">
      <Navbar />
      <div className="pt-36 max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <p className="chip">Checkout</p>
        <h1 className="mt-6 font-serif text-5xl md:text-6xl">Your tray</h1>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-7 surface p-8">
            <h2 className="font-serif text-2xl">Items</h2>
            <div className="mt-4 divider" />
            {items.length === 0 && (
              <p className="mt-8 text-[#A3978F] text-sm">
                Nothing on your tray yet. <a href="/menu" className="text-[#C7A36A] underline">Grab something</a>.
              </p>
            )}
            <ul className="mt-4 space-y-4">
              {items.map((i) => (
                <li key={i._key} data-testid={`cart-item-${i._key}`} className="flex items-start justify-between gap-4 py-4 border-b border-[#2C1A12] last:border-0">
                  <div>
                    <p className="font-serif text-xl">{i.name}</p>
                    {i.components && (
                      <p className="mt-1 text-xs text-[#A3978F]">
                        {i.components.size} · {i.components.bean} · {i.components.milk}
                        {i.components.syrups?.length > 0 && ` · ${i.components.syrups.join(", ")}`}
                        {i.components.toppings?.length > 0 && ` · ${i.components.toppings.join(", ")}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-serif text-lg">${i.price.toFixed(2)}</span>
                    <button data-testid="cart-remove" onClick={() => removeItem(i._key)} className="text-[#A3978F] hover:text-[#8A3A19]">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <h3 className="font-serif text-2xl">Pickup store</h3>
              <div className="mt-4 divider" />
              <select
                data-testid="checkout-store-select"
                value={storeId || ""}
                onChange={(e) => setStoreId(e.target.value || null)}
                className="input-dark mt-4"
              >
                <option value="">— Select a store —</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} · {s.distance_mi} mi</option>
                ))}
              </select>
            </div>
          </section>

          <aside className="lg:col-span-5 space-y-6">
            <div className="surface p-8">
              <h2 className="font-serif text-2xl">Payment</h2>
              <div className="mt-4 divider" />
              <div className="mt-5 space-y-4">
                <input data-testid="pay-name" className="input-dark" placeholder="Name on card" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                <input data-testid="pay-number" className="input-dark" placeholder="Card number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9 ]/g, ""))} maxLength={19} />
                <div className="grid grid-cols-2 gap-4">
                  <input data-testid="pay-exp" className="input-dark" placeholder="MM/YY" value={cardExp} onChange={(e) => setCardExp(e.target.value)} maxLength={5} />
                  <input data-testid="pay-cvc" className="input-dark" placeholder="CVC" value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))} maxLength={4} />
                </div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#A3978F] flex items-center gap-2 pt-2">
                  <Lock size={12} /> Demo billing · no real charge
                </p>
              </div>
            </div>

            <div className="surface p-8">
              <h2 className="font-serif text-2xl">Summary</h2>
              <div className="mt-4 divider" />
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-[#A3978F]">Subtotal</dt><dd>${total.toFixed(2)}</dd></div>
                <div className="flex justify-between"><dt className="text-[#A3978F]">Est. tax</dt><dd className="text-[#A3978F]">included</dd></div>
                <div className="flex justify-between border-t border-[#2C1A12] pt-3">
                  <dt className="font-serif text-lg">Total</dt>
                  <dd data-testid="checkout-total" className="font-serif text-2xl">${total.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between text-[#C7A36A]">
                  <dt>You'll earn</dt><dd data-testid="checkout-points">+{pointsEarned} pts</dd>
                </div>
              </dl>
              <button
                data-testid="checkout-place"
                onClick={place}
                disabled={!canPlace || placing}
                className="btn-primary mt-6 w-full justify-center"
              >
                {placing ? "Placing…" : "Place order"}
              </button>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
