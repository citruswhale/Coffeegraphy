import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Coffee, MapPin, Sparkles } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCatalog } from "../context/CatalogContext";

export default function Landing() {
  const catalog = useCatalog();
  const featured = catalog?.products?.slice(0, 4) || [];

  return (
    <div className="min-h-screen grain bg-ombre">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-40 pb-28 overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/13240964/pexels-photo-13240964.jpeg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050302]/60 to-[#050302]" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 rise">
            <span className="chip" data-testid="hero-chip">Season 05 · Small-Batch Roast</span>
            <h1 className="mt-8 font-serif text-[12vw] md:text-[88px] leading-[0.92] tracking-tight">
              Coffee, <em className="text-[#C7A36A]">composed</em>.
              <br />
              Cup by cup.
            </h1>
            <p className="mt-8 max-w-xl text-[#F5F0EB]/80 text-lg leading-relaxed rise rise-d1">
              Choose the bean. Choose the milk. Layer the syrups and dust the top.
              Every drink you imagine, crafted by a barista in your neighborhood.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 rise rise-d2">
              <Link to="/craft" data-testid="hero-cta-craft" className="btn-primary">
                Craft Your Cup <ArrowRight size={16} />
              </Link>
              <Link to="/menu" data-testid="hero-cta-menu" className="btn-ghost">
                See the Menu
              </Link>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 hidden lg:flex items-end rise rise-d3">
            <div className="w-full surface p-8">
              <p className="text-xs tracking-[0.3em] uppercase text-[#C7A36A]">Today's Pour</p>
              <h3 className="mt-4 font-serif text-3xl">Ethiopia Yirgacheffe</h3>
              <p className="mt-3 text-[#A3978F] text-sm leading-relaxed">
                Floral, bergamot, bright citrus. Pulled as a 1:2 ristretto, finished with
                oat milk and a dust of cocoa.
              </p>
              <div className="mt-6 divider" />
              <div className="mt-6 flex items-center justify-between">
                <span className="font-mono text-xs text-[#A3978F]">ROAST · LIGHT</span>
                <span className="font-serif text-2xl">$5.25</span>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="relative mt-20 border-y border-[#2C1A12] py-5 overflow-hidden">
          <div className="marquee-track flex whitespace-nowrap gap-16 text-xs tracking-[0.35em] uppercase text-[#A3978F]">
            {Array.from({ length: 4 }).map((_, i) => (
              <React.Fragment key={i}>
                <span>Single origin</span><span className="text-[#8A3A19]">◆</span>
                <span>Small batch</span><span className="text-[#8A3A19]">◆</span>
                <span>Hand-poured</span><span className="text-[#8A3A19]">◆</span>
                <span>Ethically sourced</span><span className="text-[#8A3A19]">◆</span>
                <span>10% back in points</span><span className="text-[#8A3A19]">◆</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Coffee size={22} />,
              kicker: "01 — Craft",
              title: "Your recipe, down to the gram.",
              body: "Six milks. Five single origins. Seven syrups. Seven toppings. Build the cup nobody else can.",
              cta: "Start crafting",
              to: "/craft",
              testid: "pillar-craft",
            },
            {
              icon: <MapPin size={22} />,
              kicker: "02 — Locate",
              title: "Pickup, already warm.",
              body: "Find the store nearest you. Every order is timed to the minute you walk in.",
              cta: "Find a store",
              to: "/stores",
              testid: "pillar-stores",
            },
            {
              icon: <Sparkles size={22} />,
              kicker: "03 — Reward",
              title: "Ten percent back, every pour.",
              body: "Every dollar earns you 10 points — redeem for drinks, pastries, and heirloom goods.",
              cta: "Browse rewards",
              to: "/rewards",
              testid: "pillar-rewards",
            },
          ].map((c, i) => (
            <Link key={i} to={c.to} data-testid={c.testid} className="surface p-10 hover-lift group">
              <div className="text-[#C7A36A]">{c.icon}</div>
              <p className="mt-6 text-[11px] tracking-[0.3em] uppercase text-[#A3978F]">{c.kicker}</p>
              <h3 className="mt-3 font-serif text-2xl leading-tight">{c.title}</h3>
              <p className="mt-4 text-sm text-[#A3978F] leading-relaxed">{c.body}</p>
              <p className="mt-8 text-xs tracking-[0.3em] uppercase text-[#F5F0EB] group-hover:text-[#C7A36A] flex items-center gap-2">
                {c.cta} <ArrowRight size={14} />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* STORY STRIP with cream contrast */}
      <section className="relative">
        <div className="bg-cream py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-5">
              <img
                src="https://images.pexels.com/photos/35240175/pexels-photo-35240175.jpeg"
                alt="Barista pouring milk"
                className="w-full h-[460px] object-cover"
              />
            </div>
            <div className="md:col-span-7">
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#4A2511]">Our Philosophy</p>
              <h2 className="mt-5 font-serif text-5xl leading-[1.05] text-[#1A100C]">
                Nothing hurried. <br /> Nothing hidden.
              </h2>
              <p className="mt-6 max-w-xl text-[#2C1A12] leading-relaxed text-lg">
                We work directly with seven farms. We roast the week we pour. We tell you exactly where your
                cup came from — the farmer, the altitude, the varietal. Then we hand it to you, slowly.
              </p>
              <Link to="/menu" data-testid="story-cta" className="mt-8 inline-flex items-center gap-2 text-[#4A2511] text-xs tracking-[0.3em] uppercase border-b border-[#4A2511] pb-1 hover:text-[#8A3A19] hover:border-[#8A3A19]">
                Read every origin <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between flex-wrap gap-6">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#C7A36A]">The Menu</p>
              <h2 className="mt-3 font-serif text-5xl">This season's pours</h2>
            </div>
            <Link to="/menu" className="btn-ghost" data-testid="featured-see-all">
              See full menu <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((p, i) => (
              <Link to="/menu" key={p.id} data-testid={`featured-${p.id}`} className="surface hover-lift group overflow-hidden">
                <div className="aspect-[3/4] overflow-hidden bg-[#0A0604]">
                  <img src={p.image} alt={p.name} loading="lazy"
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-[#C7A36A]">{p.tag}</p>
                  <h4 className="mt-2 font-serif text-xl leading-tight">{p.name}</h4>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-mono text-xs text-[#A3978F]">#{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-serif text-lg">${p.price.toFixed(2)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="relative py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="font-serif text-[9vw] md:text-[72px] leading-[0.95]">
            Your cup, <em className="text-[#C7A36A]">waiting</em>.
          </h2>
          <p className="mt-6 text-[#A3978F] max-w-xl mx-auto leading-relaxed">
            Join Coffeegraphy and get 100 welcome points — enough to start earning toward your first
            free pour.
          </p>
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <Link to="/register" data-testid="final-cta-join" className="btn-primary">Join Coffeegraphy</Link>
            <Link to="/craft" data-testid="final-cta-craft" className="btn-ghost">Craft a cup</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
