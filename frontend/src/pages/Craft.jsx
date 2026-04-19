import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Plus, Heart, ShoppingBag } from "lucide-react";

function Section({ kicker, title, children }) {
  return (
    <section className="mt-14">
      <p className="text-[11px] tracking-[0.3em] uppercase text-[#C7A36A]">{kicker}</p>
      <h2 className="mt-3 font-serif text-3xl md:text-4xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function OptionCard({ active, onClick, title, price, desc, image, testid }) {
  return (
    <button
      data-testid={testid}
      onClick={onClick}
      className={`text-left surface p-5 w-full transition hover-lift relative overflow-hidden ${
        active ? "!border-[#C7A36A]" : ""
      }`}
    >
      {image && (
        <div className="aspect-[4/3] mb-4 overflow-hidden bg-[#0A0604] -mx-5 -mt-5">
          <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-serif text-lg leading-tight">{title}</h4>
          {desc && <p className="mt-1 text-xs text-[#A3978F] leading-relaxed">{desc}</p>}
        </div>
        <span className={`font-mono text-xs ${price > 0 ? "text-[#C7A36A]" : "text-[#A3978F]"}`}>
          {price > 0 ? `+$${price.toFixed(2)}` : "—"}
        </span>
      </div>
      {active && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#C7A36A]" />
      )}
    </button>
  );
}

export default function Craft() {
  const catalog = useCatalog();
  const { addItem, storeId, setStoreId } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [size, setSize] = useState("tall");
  const [milk, setMilk] = useState("whole");
  const [bean, setBean] = useState("colombia");
  const [syrups, setSyrups] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [name, setName] = useState("");

  const sizeObj = catalog?.sizes?.find((s) => s.id === size);
  const milkObj = catalog?.milks?.find((m) => m.id === milk);
  const beanObj = catalog?.beans?.find((b) => b.id === bean);
  const syrupObjs = catalog?.syrups?.filter((s) => syrups.includes(s.id)) || [];
  const toppingObjs = catalog?.toppings?.filter((t) => toppings.includes(t.id)) || [];

  const price = useMemo(() => {
    if (!catalog) return 0;
    const addOns = (milkObj?.price || 0) + (beanObj?.price || 0)
      + syrupObjs.reduce((a, s) => a + s.price, 0)
      + toppingObjs.reduce((a, t) => a + t.price, 0);
    const p = (catalog.base_price * (sizeObj?.price_mult || 1)) + addOns;
    return Math.round(p * 100) / 100;
  }, [catalog, sizeObj, milkObj, beanObj, syrupObjs, toppingObjs]);

  const pointsPreview = Math.floor(price * 10);

  if (!catalog) {
    return (
      <div className="min-h-screen grain bg-ombre">
        <Navbar />
        <div className="pt-40 text-center text-[#A3978F] text-xs tracking-widest uppercase">Loading your bar…</div>
      </div>
    );
  }

  const toggleInList = (list, setList, id) =>
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const buildItem = () => ({
    name: name.trim() || `Custom ${sizeObj.name} · ${beanObj.name}`,
    price,
    quantity: 1,
    components: {
      size: sizeObj.name,
      milk: milkObj.name,
      bean: beanObj.name,
      syrups: syrupObjs.map((s) => s.name),
      toppings: toppingObjs.map((t) => t.name),
    },
  });

  const onAdd = () => {
    if (!storeId && catalog?.stores?.length) {
      setStoreId(catalog.stores[0].id);
      toast.message("Pickup set", { description: `Defaulted to ${catalog.stores[0].name}. Change on the Stores page.` });
    }
    addItem(buildItem());
    toast.success("Added to your tray");
    navigate("/checkout");
  };

  const onSave = async () => {
    if (!user || typeof user !== "object") {
      toast.error("Sign in to save drinks");
      navigate("/login");
      return;
    }
    const item = buildItem();
    try {
      await api.post("/saved-drinks", { name: item.name, components: item.components, price: item.price });
      toast.success("Saved to your dashboard");
    } catch {
      toast.error("Couldn't save drink");
    }
  };

  const store = catalog.stores.find((s) => s.id === storeId);

  return (
    <div className="min-h-screen grain bg-ombre">
      <Navbar />

      <div className="pt-36 max-w-7xl mx-auto px-6 lg:px-10 pb-40">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-8">
            <p className="chip">Craft your cup</p>
            <h1 className="mt-6 font-serif text-6xl md:text-7xl leading-[0.95]">
              Be your own <em className="text-[#C7A36A]">barista</em>.
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right text-sm text-[#A3978F]">
            {store ? (
              <>Picking up at <span className="text-[#C7A36A]">{store.name}</span> ·{" "}
                <button onClick={() => navigate("/stores")} className="underline underline-offset-4">change</button>
              </>
            ) : (
              <button
                data-testid="craft-pick-store"
                onClick={() => navigate("/stores")}
                className="underline underline-offset-4 text-[#C7A36A]"
              >
                Choose pickup store →
              </button>
            )}
          </div>
        </div>

        <Section kicker="01" title="Size">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {catalog.sizes.map((s) => (
              <OptionCard
                key={s.id}
                testid={`size-${s.id}`}
                title={`${s.name} · ${s.oz}oz`}
                desc={s.id === "tall" ? "Most loved" : ""}
                price={s.price_mult > 1 ? (catalog.base_price * (s.price_mult - 1)) : 0}
                active={size === s.id}
                onClick={() => setSize(s.id)}
              />
            ))}
          </div>
        </Section>

        <Section kicker="02" title="Single-origin bean">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalog.beans.map((b) => (
              <OptionCard key={b.id} testid={`bean-${b.id}`} title={b.name} desc={b.desc} price={b.price}
                          active={bean === b.id} onClick={() => setBean(b.id)} />
            ))}
          </div>
        </Section>

        <Section kicker="03" title="Milk">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {catalog.milks.map((m) => (
              <OptionCard key={m.id} testid={`milk-${m.id}`} title={m.name} desc={m.desc} price={m.price}
                          active={milk === m.id} onClick={() => setMilk(m.id)} />
            ))}
          </div>
        </Section>

        <Section kicker="04" title="Syrups (choose any)">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {catalog.syrups.map((s) => (
              <OptionCard key={s.id} testid={`syrup-${s.id}`} title={s.name} price={s.price}
                          active={syrups.includes(s.id)} onClick={() => toggleInList(syrups, setSyrups, s.id)} />
            ))}
          </div>
        </Section>

        <Section kicker="05" title="Toppings & finishes">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {catalog.toppings.map((t) => (
              <OptionCard key={t.id} testid={`topping-${t.id}`} title={t.name} price={t.price}
                          active={toppings.includes(t.id)} onClick={() => toggleInList(toppings, setToppings, t.id)} />
            ))}
          </div>
        </Section>

        <Section kicker="06" title="Name your drink (optional)">
          <input
            data-testid="craft-name"
            className="input-dark max-w-md"
            placeholder="e.g. The Morning Auburn"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Section>
      </div>

      {/* Sticky bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-black/85 backdrop-blur-xl border-t border-[#2C1A12]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-wrap items-center gap-5 justify-between">
          <div className="flex items-baseline gap-6">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#A3978F]">Total</p>
              <p data-testid="craft-total" className="font-serif text-3xl">${price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#A3978F]">Earns</p>
              <p data-testid="craft-points" className="font-serif text-xl text-[#C7A36A]">{pointsPreview} pts</p>
            </div>
            <div className="hidden md:block text-xs text-[#A3978F] max-w-sm">
              {sizeObj.name} · {beanObj.name} · {milkObj.name}
              {syrupObjs.length > 0 && ` · ${syrupObjs.length} syrup${syrupObjs.length > 1 ? "s" : ""}`}
              {toppingObjs.length > 0 && ` · ${toppingObjs.length} topping${toppingObjs.length > 1 ? "s" : ""}`}
            </div>
          </div>
          <div className="flex gap-3">
            <button data-testid="craft-save" onClick={onSave} className="btn-ghost">
              <Heart size={14} /> Save
            </button>
            <button data-testid="craft-add" onClick={onAdd} className="btn-primary">
              <ShoppingBag size={14} /> Add & checkout
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
