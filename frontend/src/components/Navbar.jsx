import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Menu, X, ShoppingBag } from "lucide-react";

const NAV = [
  { to: "/menu", label: "Menu" },
  { to: "/craft", label: "Craft" },
  { to: "/stores", label: "Stores" },
  { to: "/rewards", label: "Rewards" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const authed = user && typeof user === "object";

  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-xl bg-black/70 border-b border-[#2C1A12]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" data-testid="nav-brand" className="flex items-center gap-3 group">
          <span className="font-serif text-[22px] tracking-tight text-[#F5F0EB]">
            Coffee<span className="text-[#C7A36A]">graphy</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase()}`}
              className={({ isActive }) =>
                `text-[13px] tracking-[0.2em] uppercase transition-colors ${
                  isActive ? "text-[#C7A36A]" : "text-[#F5F0EB]/80 hover:text-[#C7A36A]"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {items.length > 0 && (
            <button
              data-testid="nav-cart-btn"
              onClick={() => navigate("/checkout")}
              className="relative text-[#F5F0EB] hover:text-[#C7A36A] transition"
              aria-label="Cart"
            >
              <ShoppingBag size={18} />
              <span className="absolute -top-2 -right-2 bg-[#8A3A19] text-[10px] rounded-full w-4 h-4 flex items-center justify-center text-white">
                {items.length}
              </span>
            </button>
          )}
          {authed ? (
            <>
              <Link
                to="/dashboard"
                data-testid="nav-dashboard"
                className="text-[12px] tracking-[0.2em] uppercase text-[#F5F0EB]/80 hover:text-[#C7A36A]"
              >
                {user.points} pts
              </Link>
              <button data-testid="nav-logout" onClick={logout} className="btn-ghost !py-2 !px-4 !text-[11px]">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" data-testid="nav-login" className="text-[12px] tracking-[0.2em] uppercase text-[#F5F0EB]/80 hover:text-[#C7A36A]">
                Sign in
              </Link>
              <Link to="/register" data-testid="nav-register" className="btn-primary !py-2 !px-5 !text-[11px]">
                Join
              </Link>
            </>
          )}
        </div>

        <button
          data-testid="nav-mobile-toggle"
          className="md:hidden text-[#F5F0EB]"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#2C1A12] bg-black/95">
          <div className="px-6 py-4 flex flex-col gap-3">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm tracking-widest uppercase py-2 ${isActive ? "text-[#C7A36A]" : "text-[#F5F0EB]/80"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            {authed ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="text-sm tracking-widest uppercase py-2">Dashboard · {user.points} pts</Link>
                <button onClick={() => { logout(); setOpen(false); }} className="btn-ghost">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost text-center">Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-center">Join</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
