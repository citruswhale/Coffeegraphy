from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXP_MIN = 60 * 24  # 24h for smoother UX in demo
REFRESH_TOKEN_EXP_DAYS = 7

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Coffeegraphy API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger("ember")


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def _jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXP_MIN),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXP_DAYS),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=False,
                        samesite="lax", max_age=ACCESS_TOKEN_EXP_MIN * 60, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False,
                        samesite="lax", max_age=REFRESH_TOKEN_EXP_DAYS * 86400, path="/")


def _serialize_user(u: dict) -> dict:
    return {
        "id": str(u["_id"]),
        "email": u["email"],
        "name": u.get("name", ""),
        "role": u.get("role", "user"),
        "points": u.get("points", 0),
        "created_at": u.get("created_at").isoformat() if isinstance(u.get("created_at"), datetime) else u.get("created_at"),
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class RegisterInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=80)


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class OrderItem(BaseModel):
    name: str
    price: float
    components: Optional[dict] = None  # For DIY drinks: {milk, beans, syrups, toppings, size}
    product_id: Optional[str] = None
    quantity: int = 1


class OrderCreate(BaseModel):
    store_id: str
    items: List[OrderItem]
    payment: dict  # dummy: {card_name, card_last4}


class SavedDrink(BaseModel):
    name: str
    components: dict
    price: float


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------
@api.post("/auth/register")
async def register(body: RegisterInput, response: Response):
    email = body.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": email,
        "name": body.name.strip(),
        "password_hash": hash_password(body.password),
        "role": "user",
        "points": 100,  # welcome points
        "created_at": datetime.now(timezone.utc),
    }
    res = await db.users.insert_one(doc)
    uid = str(res.inserted_id)
    set_auth_cookies(response, create_access_token(uid, email), create_refresh_token(uid))
    doc["_id"] = res.inserted_id
    return _serialize_user(doc)


@api.post("/auth/login")
async def login(body: LoginInput, response: Response):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    uid = str(user["_id"])
    set_auth_cookies(response, create_access_token(uid, email), create_refresh_token(uid))
    return _serialize_user(user)


@api.post("/auth/logout")
async def logout(response: Response, user: dict = Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return _serialize_user(user)


@api.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        uid = payload["sub"]
        user = await db.users.find_one({"_id": ObjectId(uid)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(uid, user["email"])
        response.set_cookie("access_token", access, httponly=True, secure=False,
                            samesite="lax", max_age=ACCESS_TOKEN_EXP_MIN * 60, path="/")
        return {"ok": True}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---------------------------------------------------------------------------
# Catalog (seeded constants — returned from memory for speed)
# ---------------------------------------------------------------------------
SIZES = [
    {"id": "short", "name": "Short", "oz": 8, "price_mult": 0.85},
    {"id": "tall", "name": "Tall", "oz": 12, "price_mult": 1.0},
    {"id": "grande", "name": "Grande", "oz": 16, "price_mult": 1.15},
    {"id": "venti", "name": "Venti", "oz": 20, "price_mult": 1.3},
]

MILKS = [
    {"id": "whole", "name": "Whole Milk", "price": 0, "desc": "Classic, creamy balance"},
    {"id": "oat", "name": "Oat Milk", "price": 0.85, "desc": "Silky, nutty, barista-grade"},
    {"id": "almond", "name": "Almond Milk", "price": 0.75, "desc": "Light & toasty"},
    {"id": "coconut", "name": "Coconut Milk", "price": 0.75, "desc": "Tropical & velvety"},
    {"id": "soy", "name": "Soy Milk", "price": 0.65, "desc": "Smooth & protein-rich"},
    {"id": "skim", "name": "Skim Milk", "price": 0, "desc": "Lean & light"},
]

BEANS = [
    {"id": "ethiopia", "name": "Ethiopia Yirgacheffe", "price": 0.9, "desc": "Floral, bergamot, bright citrus"},
    {"id": "colombia", "name": "Colombia Huila", "price": 0.5, "desc": "Caramel, cocoa, balanced body"},
    {"id": "sumatra", "name": "Sumatra Mandheling", "price": 0.7, "desc": "Earthy, dark chocolate, full body"},
    {"id": "guatemala", "name": "Guatemala Antigua", "price": 0.6, "desc": "Spice, smoky, toasted almond"},
    {"id": "kenya", "name": "Kenya AA", "price": 1.1, "desc": "Blackcurrant, winy, vibrant"},
]

SYRUPS = [
    {"id": "vanilla", "name": "Madagascar Vanilla", "price": 0.6},
    {"id": "caramel", "name": "Burnt Caramel", "price": 0.6},
    {"id": "hazelnut", "name": "Toasted Hazelnut", "price": 0.6},
    {"id": "mocha", "name": "Dark Mocha", "price": 0.75},
    {"id": "cinnamon", "name": "Cinnamon Bark", "price": 0.5},
    {"id": "maple", "name": "Smoked Maple", "price": 0.75},
    {"id": "lavender", "name": "Honey Lavender", "price": 0.8},
]

TOPPINGS = [
    {"id": "whipped", "name": "Whipped Cream", "price": 0.5},
    {"id": "cocoa", "name": "Cocoa Dust", "price": 0.3},
    {"id": "cinnamon_p", "name": "Cinnamon Powder", "price": 0.3},
    {"id": "choc_shave", "name": "Dark Chocolate Shavings", "price": 0.6},
    {"id": "caramel_drz", "name": "Caramel Drizzle", "price": 0.5},
    {"id": "sea_salt", "name": "Flake Sea Salt", "price": 0.4},
    {"id": "marshmallow", "name": "Toasted Marshmallow", "price": 0.55},
]

PRODUCTS = [
    {"id": "p1", "name": "Espresso Classico", "price": 3.5, "tag": "Signature",
     "desc": "A pure, double shot of our house Sumatra blend. Bold and uncompromising.",
     "image": "https://images.pexels.com/photos/13240964/pexels-photo-13240964.jpeg"},
    {"id": "p2", "name": "Auburn Latte", "price": 5.25, "tag": "House Favorite",
     "desc": "Velvety oat milk, burnt caramel, and a whisper of smoked maple.",
     "image": "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=1200"},
    {"id": "p3", "name": "Obsidian Cold Brew", "price": 4.75, "tag": "Cold",
     "desc": "Slow-steeped 18 hours. Dark chocolate, stone fruit, no bitterness.",
     "image": "https://images.pexels.com/photos/14119654/pexels-photo-14119654.jpeg"},
    {"id": "p4", "name": "Honey Lavender Cortado", "price": 5.5, "tag": "Seasonal",
     "desc": "Equal parts espresso and micro-foamed milk, kissed with honey lavender.",
     "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200"},
    {"id": "p5", "name": "Mocha Noir", "price": 5.75, "tag": "Indulgent",
     "desc": "Single-origin espresso, 72% dark chocolate, steamed whole milk.",
     "image": "https://images.unsplash.com/photo-1517231925375-bf2cb42917a5?w=1200"},
    {"id": "p6", "name": "Flat White", "price": 4.95, "tag": "Classic",
     "desc": "Two ristretto shots, micro-textured milk. Velvet in a cup.",
     "image": "https://images.unsplash.com/photo-1534687941688-651ccaafbff8?w=1200"},
    {"id": "p7", "name": "Cinnamon Cortado", "price": 4.9, "tag": "Warm",
     "desc": "Equal espresso and steamed milk, finished with cinnamon bark.",
     "image": "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=1200"},
    {"id": "p8", "name": "Iced Vanilla Americano", "price": 4.25, "tag": "Cold",
     "desc": "Espresso over ice with Madagascar vanilla. Crisp and clean.",
     "image": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1200"},
]

STORES = [
    {"id": "s1", "name": "Coffeegraphy — Soho", "city": "London", "address": "25 Dean St, London W1D 3RY",
     "distance_mi": 0.6, "hours": "6:30a – 9:00p", "phone": "+44 20 7946 0117",
     "image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200"},
    {"id": "s2", "name": "Coffeegraphy — Shoreditch", "city": "London", "address": "142 Curtain Rd, London EC2A 3AR",
     "distance_mi": 1.9, "hours": "7:00a – 8:30p", "phone": "+44 20 7946 0142",
     "image": "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=1200"},
    {"id": "s3", "name": "Coffeegraphy — Marylebone Roastery", "city": "London", "address": "67 Marylebone High St, W1U 5JF",
     "distance_mi": 2.4, "hours": "6:00a – 10:00p", "phone": "+44 20 7946 0181",
     "image": "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=1200"},
    {"id": "s4", "name": "Coffeegraphy — Covent Garden", "city": "London", "address": "18 Floral St, London WC2E 9DS",
     "distance_mi": 1.1, "hours": "6:30a – 8:00p", "phone": "+44 20 7946 0133",
     "image": "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1200"},
    {"id": "s5", "name": "Coffeegraphy — Notting Hill", "city": "London", "address": "210 Portobello Rd, London W11 1LJ",
     "distance_mi": 3.5, "hours": "7:00a – 9:30p", "phone": "+44 20 7946 0164",
     "image": "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1200"},
    {"id": "s6", "name": "Coffeegraphy — Borough", "city": "London", "address": "8 Park St, London SE1 9AB",
     "distance_mi": 2.1, "hours": "6:30a – 8:30p", "phone": "+44 20 7946 0152",
     "image": "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1200"},
]

REWARDS = [
    {"id": "r1", "name": "Free House Drip", "cost": 150, "desc": "Any size of our house drip coffee."},
    {"id": "r2", "name": "Extra Espresso Shot", "cost": 80, "desc": "Add a shot to any drink, on us."},
    {"id": "r3", "name": "Signature Pastry", "cost": 220, "desc": "Choose any in-store pastry."},
    {"id": "r4", "name": "Free Specialty Latte", "cost": 400, "desc": "Any latte up to Grande."},
    {"id": "r5", "name": "250g Single-Origin Bag", "cost": 900, "desc": "Whole bean or ground, your choice."},
    {"id": "r6", "name": "Ember & Oak Ceramic Mug", "cost": 650, "desc": "Our heirloom stoneware mug."},
]


@api.get("/catalog")
async def get_catalog():
    return {
        "sizes": SIZES, "milks": MILKS, "beans": BEANS,
        "syrups": SYRUPS, "toppings": TOPPINGS,
        "products": PRODUCTS, "stores": STORES, "rewards": REWARDS,
        "base_price": 3.0,  # base espresso cost, scales with size multiplier
    }


@api.get("/stores")
async def get_stores():
    return STORES


@api.get("/products")
async def get_products():
    return PRODUCTS


@api.get("/rewards")
async def get_rewards():
    return REWARDS


# ---------------------------------------------------------------------------
# Orders, saved drinks, rewards
# ---------------------------------------------------------------------------
@api.post("/orders")
async def create_order(body: OrderCreate, user: dict = Depends(get_current_user)):
    total = round(sum(i.price * i.quantity for i in body.items), 2)
    points_earned = int(total * 10)  # 10 points per dollar = 10% of spend value
    order_doc = {
        "_id": ObjectId(),
        "user_id": str(user["_id"]),
        "store_id": body.store_id,
        "items": [i.model_dump() for i in body.items],
        "total": total,
        "points_earned": points_earned,
        "payment_last4": body.payment.get("card_last4", "0000"),
        "created_at": datetime.now(timezone.utc),
        "status": "confirmed",
    }
    await db.orders.insert_one(order_doc)
    await db.users.update_one({"_id": user["_id"]}, {"$inc": {"points": points_earned}})
    return {
        "id": str(order_doc["_id"]),
        "total": total,
        "points_earned": points_earned,
        "store_id": body.store_id,
        "created_at": order_doc["created_at"].isoformat(),
        "items": order_doc["items"],
    }


@api.get("/orders")
async def list_orders(user: dict = Depends(get_current_user)):
    cursor = db.orders.find({"user_id": str(user["_id"])}).sort("created_at", -1).limit(50)
    out = []
    async for o in cursor:
        out.append({
            "id": str(o["_id"]),
            "total": o["total"],
            "points_earned": o["points_earned"],
            "store_id": o["store_id"],
            "items": o["items"],
            "status": o.get("status", "confirmed"),
            "created_at": o["created_at"].isoformat() if isinstance(o["created_at"], datetime) else o["created_at"],
        })
    return out


@api.post("/saved-drinks")
async def save_drink(body: SavedDrink, user: dict = Depends(get_current_user)):
    doc = {
        "_id": ObjectId(),
        "user_id": str(user["_id"]),
        "name": body.name,
        "components": body.components,
        "price": body.price,
        "created_at": datetime.now(timezone.utc),
    }
    await db.saved_drinks.insert_one(doc)
    return {"id": str(doc["_id"]), "name": doc["name"], "components": doc["components"], "price": doc["price"]}


@api.get("/saved-drinks")
async def list_saved_drinks(user: dict = Depends(get_current_user)):
    cursor = db.saved_drinks.find({"user_id": str(user["_id"])}).sort("created_at", -1)
    out = []
    async for d in cursor:
        out.append({
            "id": str(d["_id"]),
            "name": d["name"],
            "components": d["components"],
            "price": d["price"],
        })
    return out


@api.delete("/saved-drinks/{drink_id}")
async def delete_saved_drink(drink_id: str, user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(drink_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    res = await db.saved_drinks.delete_one({"_id": oid, "user_id": str(user["_id"])})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@api.post("/rewards/redeem/{reward_id}")
async def redeem_reward(reward_id: str, user: dict = Depends(get_current_user)):
    reward = next((r for r in REWARDS if r["id"] == reward_id), None)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    if user.get("points", 0) < reward["cost"]:
        raise HTTPException(status_code=400, detail="Not enough points")
    await db.users.update_one({"_id": user["_id"]}, {"$inc": {"points": -reward["cost"]}})
    redemption = {
        "_id": ObjectId(),
        "user_id": str(user["_id"]),
        "reward_id": reward_id,
        "reward_name": reward["name"],
        "cost": reward["cost"],
        "code": secrets.token_hex(4).upper(),
        "created_at": datetime.now(timezone.utc),
    }
    await db.redemptions.insert_one(redemption)
    return {
        "id": str(redemption["_id"]),
        "reward_name": reward["name"],
        "cost": reward["cost"],
        "code": redemption["code"],
    }


@api.get("/redemptions")
async def list_redemptions(user: dict = Depends(get_current_user)):
    cursor = db.redemptions.find({"user_id": str(user["_id"])}).sort("created_at", -1).limit(50)
    out = []
    async for r in cursor:
        out.append({
            "id": str(r["_id"]),
            "reward_name": r["reward_name"],
            "cost": r["cost"],
            "code": r["code"],
            "created_at": r["created_at"].isoformat() if isinstance(r["created_at"], datetime) else r["created_at"],
        })
    return out


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@api.get("/")
async def root():
    return {"service": "ember-oak", "status": "ok"}


# ---------------------------------------------------------------------------
# Mount + CORS + startup
# ---------------------------------------------------------------------------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.environ.get("CORS_ORIGINS", "*") == "*" else os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def seed():
    await db.users.create_index("email", unique=True)
    await db.orders.create_index("user_id")
    await db.saved_drinks.create_index("user_id")
    await db.redemptions.create_index("user_id")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@coffeegraphy.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "name": "Admin",
            "password_hash": hash_password(admin_password),
            "role": "admin",
            "points": 0,
            "created_at": datetime.now(timezone.utc),
        })
        logger.info("Seeded admin: %s", admin_email)
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email},
                                  {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Updated admin password hash")

    demo_email = "demo@coffeegraphy.com"
    demo_password = "demo1234"
    demo = await db.users.find_one({"email": demo_email})
    if demo is None:
        await db.users.insert_one({
            "email": demo_email,
            "name": "Demo Guest",
            "password_hash": hash_password(demo_password),
            "role": "user",
            "points": 450,
            "created_at": datetime.now(timezone.utc),
        })
        logger.info("Seeded demo user")
    elif not verify_password(demo_password, demo["password_hash"]):
        await db.users.update_one({"email": demo_email},
                                  {"$set": {"password_hash": hash_password(demo_password)}})


@app.on_event("startup")
async def on_start():
    await seed()


@app.on_event("shutdown")
async def on_stop():
    client.close()
