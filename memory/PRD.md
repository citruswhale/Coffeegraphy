# Ember & Oak — Coffee DIY App · PRD

## Original Problem Statement
A Starbucks-inspired but better online coffee app with:
- Landing page
- Products page
- Nearby store finder page
- Store-linked DIY coffee builder (milks, beans, syrups, toppings)
- USP: save preferences to user dashboard
- Dummy billing
- 10% of spend added as points, redeemable for rewards
- Black-brown-auburn ombre styling, clean and sophisticated

## User Choices
- Auth: JWT email/password (custom)
- Stores: mocked/seeded (6 curated NYC/Brooklyn locations)
- Billing: fully dummy
- Rewards: 6 curated items
- Aesthetic: black → espresso → auburn ombre, serif+sans pairing (Playfair Display + Outfit), generous spacing, cream accents, grain overlay

## Architecture
- Backend: FastAPI + Motor/MongoDB, cookie-based JWT auth (access + refresh), /api prefix for all routes
- Frontend: React 19, React Router 7, Tailwind CSS + Shadcn primitives, Sonner for toasts, axios with `withCredentials`
- Brand: "Ember & Oak"

## Personas
- **Guest visitor** — browses menu, stores, rewards; signs up to craft/save
- **Member** — crafts drinks, saves recipes, places pickup orders, earns & redeems points

## What's Been Implemented (Iteration 1 · Feb 2026)
- Full JWT auth (register w/ 100 welcome pts, login, logout, refresh, /me)
- Admin + demo user seeded (`admin@emberandoak.com`, `demo@emberandoak.com`)
- Catalog endpoint (4 sizes, 6 milks, 5 beans, 7 syrups, 7 toppings, 8 products, 6 stores, 6 rewards)
- Orders: create w/ automatic points accrual (10 pts/$), list user orders
- Saved drinks: create / list / delete
- Rewards: redeem (deducts points, returns unique code)
- Pages: Landing, Menu, Stores (map + list + search), Craft (live price/points), Dashboard, Rewards, Checkout (dummy billing w/ confirmation), Login, Register
- Auburn ombre theme, grain texture, Playfair Display + Outfit typography, smooth animations
- Cart/Cart context, Catalog context, Auth context
- Testing: 14/14 pytest backend + end-to-end frontend flows verified

## Prioritized Backlog / Future
- **P1** — Strip whitespace in card number length check (minor UX polish)
- **P1** — Email notifications on order confirmation (e.g., Resend integration)
- **P2** — Real map integration (Google Maps / Leaflet) replacing abstract pin grid
- **P2** — Mobile-optimized DIY stepper (full-screen step-by-step for small screens)
- **P2** — Favorite an order from history (one-tap reorder)
- **P2** — Admin dashboard to manage store hours, product availability, specials
- **P3** — Real payment integration (Stripe test mode)
- **P3** — Loyalty tiers (Ember / Oak / Auburn) with multiplier perks
- **P3** — Rich order-status tracking (brewing → ready)
