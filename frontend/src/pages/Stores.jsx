import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { MapPin, Phone, Clock, ArrowRight } from "lucide-react";

export default function Stores() {
  const catalog = useCatalog();
  const { setStoreId } = useCart();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const stores = catalog?.stores || [];
  const filtered = useMemo(() =>
    stores.filter((s) => (s.name + s.city + s.address).toLowerCase().includes(q.toLowerCase())),
    [stores, q]
  );

  const selectAndCraft = (s) => {
    setStoreId(s.id);
    navigate("/craft");
  };

  return (
    <div className="min-h-screen grain bg-ombre">
      <Navbar />

      <section className="pt-36 pb-10 max-w-7xl mx-auto px-6 lg:px-10">
        <p className="chip">Locations</p>
        <h1 className="mt-6 font-serif text-6xl md:text-7xl leading-[0.95]">
          Six stores, <em className="text-[#C7A36A]">hand-picked</em>.
        </h1>
        <p className="mt-6 max-w-xl text-[#A3978F] leading-relaxed">
          Choose the location nearest you. Your drink will be timed to the minute you arrive.
        </p>

        <div className="mt-10 flex gap-3">
          <input
            data-testid="stores-search"
            className="input-dark max-w-md"
            placeholder="Search by name, city, or address…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          {filtered.map((s) => {
            const isSel = selected === s.id;
            return (
              <article
                key={s.id}
                data-testid={`store-${s.id}`}
                onClick={() => setSelected(s.id)}
                className={`surface p-6 md:p-7 cursor-pointer grid grid-cols-12 gap-5 ${
                  isSel ? "!border-[#8A3A19]" : ""
                }`}
              >
                <div className="col-span-4 aspect-square overflow-hidden bg-[#0A0604]">
                  <img src={s.image} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="col-span-8 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-[#C7A36A]">{s.city}</p>
                    <h3 className="mt-2 font-serif text-2xl leading-tight">{s.name}</h3>
                    <ul className="mt-4 space-y-1.5 text-sm text-[#A3978F]">
                      <li className="flex items-center gap-2"><MapPin size={14} className="text-[#8A3A19]" /> {s.address}</li>
                      <li className="flex items-center gap-2"><Clock size={14} className="text-[#8A3A19]" /> {s.hours}</li>
                      <li className="flex items-center gap-2"><Phone size={14} className="text-[#8A3A19]" /> {s.phone}</li>
                    </ul>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="font-mono text-xs text-[#A3978F]">{s.distance_mi} mi</span>
                    <button
                      data-testid={`store-select-${s.id}`}
                      onClick={(e) => { e.stopPropagation(); selectAndCraft(s); }}
                      className="btn-primary !py-2 !px-4 !text-[11px]"
                    >
                      Pickup here <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {filtered.length === 0 && (
            <div className="surface p-8 text-center text-[#A3978F]">No stores match your search.</div>
          )}
        </div>

        <aside className="lg:col-span-5 lg:sticky lg:top-24 h-fit surface p-8 overflow-hidden">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#C7A36A]">Map View</p>
          <div className="mt-4 relative aspect-square rounded-sm overflow-hidden" style={{
            background: "radial-gradient(800px 500px at 30% 20%, rgba(138,58,25,0.35), transparent 60%), radial-gradient(600px 400px at 70% 80%, rgba(74,37,17,0.45), transparent 60%), #0A0604"
          }}>
            <div className="absolute inset-0">
              {/* Abstract grid */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={`h${i}`} className="absolute left-0 right-0" style={{ top: `${(i / 12) * 100}%`, height: 1, background: "rgba(199,163,106,0.06)" }} />
              ))}
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={`v${i}`} className="absolute top-0 bottom-0" style={{ left: `${(i / 12) * 100}%`, width: 1, background: "rgba(199,163,106,0.06)" }} />
              ))}
              {/* Pins */}
              {filtered.slice(0, 10).map((s, i) => {
                const x = 15 + ((i * 53) % 70);
                const y = 15 + ((i * 37) % 70);
                const isSel = selected === s.id;
                return (
                  <button
                    key={s.id}
                    data-testid={`map-pin-${s.id}`}
                    onClick={() => setSelected(s.id)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <span className={`block w-3 h-3 rounded-full ${isSel ? "bg-[#C7A36A]" : "bg-[#8A3A19]"} ring-4 ring-[#8A3A19]/20 transition`} />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/80 text-[10px] tracking-widest uppercase px-2 py-1 opacity-0 group-hover:opacity-100 transition">
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <p className="mt-6 text-xs text-[#A3978F]">
            Tap a pin to preview, or click <span className="text-[#C7A36A]">Pickup here</span> to begin your craft.
          </p>
        </aside>
      </section>

      <Footer />
    </div>
  );
}
