import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[#050302] border-t border-[#2C1A12] mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <h3 className="font-serif text-3xl">Coffeegraphy</h3>
          <p className="mt-4 text-[#A3978F] max-w-sm leading-relaxed">
            Slow-roasted, single-origin coffee crafted in small batches. From farm to your
            hand-built cup.
          </p>
          <div className="mt-6 divider" />
          <p className="mt-6 text-xs tracking-widest uppercase text-[#A3978F]">
            Est. 2019 · Shoreditch, London
          </p>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.3em] uppercase text-[#C7A36A]">Explore</h4>
          <ul className="mt-5 space-y-3 text-[#F5F0EB]/80 text-sm">
            <li><Link to="/menu" className="hover:text-[#C7A36A]">Menu</Link></li>
            <li><Link to="/craft" className="hover:text-[#C7A36A]">Craft Your Cup</Link></li>
            <li><Link to="/stores" className="hover:text-[#C7A36A]">Stores</Link></li>
            <li><Link to="/rewards" className="hover:text-[#C7A36A]">Rewards</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.3em] uppercase text-[#C7A36A]">Account</h4>
          <ul className="mt-5 space-y-3 text-[#F5F0EB]/80 text-sm">
            <li><Link to="/login" className="hover:text-[#C7A36A]">Sign in</Link></li>
            <li><Link to="/register" className="hover:text-[#C7A36A]">Join</Link></li>
            <li><Link to="/dashboard" className="hover:text-[#C7A36A]">Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#2C1A12] py-6 text-center text-[11px] tracking-widest uppercase text-[#A3978F]">
        © {new Date().getFullYear()} Coffeegraphy · Crafted with intention
      </div>
    </footer>
  );
}
