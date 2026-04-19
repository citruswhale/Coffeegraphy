import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCatalog } from "../context/CatalogContext";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function Menu() {
  const catalog = useCatalog();
  const { addItem } = useCart();

  return (
    <div className="min-h-screen grain bg-ombre">
      <Navbar />
      <div className="pt-36 pb-16 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-8">
            <p className="chip">The Menu</p>
            <h1 className="mt-6 font-serif text-6xl md:text-7xl leading-[0.95]">
              Every pour, <em className="text-[#C7A36A]">composed</em>.
            </h1>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right">
            <p className="text-[#A3978F] leading-relaxed text-sm">
              Season 05 · Eight signature drinks, rotating weekly. Want something different?{" "}
              <Link to="/craft" className="text-[#C7A36A] underline underline-offset-4">Build your own.</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(catalog?.products || []).map((p) => (
          <article key={p.id} data-testid={`menu-${p.id}`} className="surface overflow-hidden hover-lift group">
            <div className="aspect-[4/5] overflow-hidden bg-[#0A0604]">
              <img src={p.image} alt={p.name} loading="lazy"
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="p-6">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#C7A36A]">{p.tag}</p>
              <h3 className="mt-2 font-serif text-2xl leading-tight">{p.name}</h3>
              <p className="mt-3 text-sm text-[#A3978F] leading-relaxed">{p.desc}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="font-serif text-2xl">${p.price.toFixed(2)}</span>
                <button
                  data-testid={`menu-add-${p.id}`}
                  onClick={() => { addItem({ name: p.name, price: p.price, product_id: p.id, quantity: 1 }); toast.success(`Added · ${p.name}`); }}
                  className="btn-primary !py-2 !px-4 !text-[11px]"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Footer />
    </div>
  );
}
