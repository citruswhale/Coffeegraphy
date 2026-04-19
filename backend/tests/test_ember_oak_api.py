"""End-to-end backend API tests for Ember & Oak coffee API."""
import os
import time
import requests
import pytest

BASE = os.environ['REACT_APP_BACKEND_URL'].rstrip('/') if os.environ.get('REACT_APP_BACKEND_URL') else \
    open('/app/frontend/.env').read().split('REACT_APP_BACKEND_URL=')[1].split('\n')[0].strip()
API = f"{BASE}/api"

DEMO_EMAIL = "demo@emberandoak.com"
DEMO_PASS = "demo1234"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def auth_session(session):
    r = session.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return session


# --- Health & catalog ---
def test_health():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


def test_catalog_shape():
    r = requests.get(f"{API}/catalog")
    assert r.status_code == 200
    d = r.json()
    assert len(d["sizes"]) == 4
    assert len(d["milks"]) == 6
    assert len(d["beans"]) == 5
    assert len(d["syrups"]) == 7
    assert len(d["toppings"]) == 7
    assert len(d["products"]) == 8
    assert len(d["stores"]) == 6
    assert len(d["rewards"]) == 6
    assert d["base_price"] == 3.0


# --- Auth ---
def test_login_demo_returns_user_with_points():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASS})
    assert r.status_code == 200
    u = r.json()
    assert u["email"] == DEMO_EMAIL
    assert isinstance(u["points"], int)
    # cookies must be set
    assert "access_token" in s.cookies
    assert "refresh_token" in s.cookies


def test_login_invalid():
    r = requests.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_register_new_user_welcome_points():
    s = requests.Session()
    email = f"test_user_{int(time.time()*1000)}@example.com"
    r = s.post(f"{API}/auth/register", json={"email": email, "password": "secret123", "name": "Test User"})
    assert r.status_code == 200, r.text
    u = r.json()
    assert u["points"] == 100
    assert u["email"] == email
    assert "access_token" in s.cookies
    # /me works
    me = s.get(f"{API}/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == email


def test_register_duplicate_rejected(auth_session):
    r = requests.post(f"{API}/auth/register",
                      json={"email": DEMO_EMAIL, "password": "demo1234", "name": "x"})
    assert r.status_code == 400


def test_me_unauthenticated():
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


def test_me_authenticated(auth_session):
    r = auth_session.get(f"{API}/auth/me")
    assert r.status_code == 200
    assert r.json()["email"] == DEMO_EMAIL


# --- Orders ---
def test_create_order_increments_points(auth_session):
    me_before = auth_session.get(f"{API}/auth/me").json()
    pts_before = me_before["points"]
    payload = {
        "store_id": "s1",
        "items": [{"name": "Auburn Latte", "price": 5.25, "quantity": 1, "product_id": "p2"}],
        "payment": {"card_name": "Demo", "card_last4": "4242"},
    }
    r = auth_session.post(f"{API}/orders", json=payload)
    assert r.status_code == 200, r.text
    order = r.json()
    assert "id" in order
    assert order["total"] == 5.25
    assert order["points_earned"] == 52  # floor(5.25*10)

    me_after = auth_session.get(f"{API}/auth/me").json()
    assert me_after["points"] == pts_before + 52

    # GET /orders includes it
    lst = auth_session.get(f"{API}/orders")
    assert lst.status_code == 200
    ids = [o["id"] for o in lst.json()]
    assert order["id"] in ids


def test_orders_unauthenticated():
    r = requests.get(f"{API}/orders")
    assert r.status_code == 401


# --- Saved drinks ---
def test_saved_drinks_crud(auth_session):
    payload = {
        "name": "TEST_MyMocha",
        "components": {"size": "grande", "bean": "ethiopia", "milk": "oat", "syrups": ["mocha"], "toppings": ["whipped"]},
        "price": 6.85,
    }
    r = auth_session.post(f"{API}/saved-drinks", json=payload)
    assert r.status_code == 200, r.text
    saved = r.json()
    drink_id = saved["id"]
    assert saved["name"] == "TEST_MyMocha"

    lst = auth_session.get(f"{API}/saved-drinks")
    assert lst.status_code == 200
    assert any(d["id"] == drink_id for d in lst.json())

    d = auth_session.delete(f"{API}/saved-drinks/{drink_id}")
    assert d.status_code == 200

    lst2 = auth_session.get(f"{API}/saved-drinks")
    assert not any(x["id"] == drink_id for x in lst2.json())


def test_delete_saved_drink_invalid_id(auth_session):
    r = auth_session.delete(f"{API}/saved-drinks/notanid")
    assert r.status_code == 400


# --- Rewards ---
def test_redeem_reward_success_and_insufficient(auth_session):
    me = auth_session.get(f"{API}/auth/me").json()
    pts_before = me["points"]
    # r2 = 80 pts (cheapest besides r1)
    r = auth_session.post(f"{API}/rewards/redeem/r2")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["cost"] == 80
    assert len(body["code"]) == 8

    me2 = auth_session.get(f"{API}/auth/me").json()
    assert me2["points"] == pts_before - 80

    # Insufficient — try huge cost reward many times until it fails
    # Use a fresh user with only welcome 100 points
    s = requests.Session()
    email = f"poor_{int(time.time()*1000)}@example.com"
    s.post(f"{API}/auth/register", json={"email": email, "password": "secret123", "name": "Poor"})
    r2 = s.post(f"{API}/rewards/redeem/r5")  # 900 pts
    assert r2.status_code == 400


def test_redeem_invalid_reward(auth_session):
    r = auth_session.post(f"{API}/rewards/redeem/nope")
    assert r.status_code == 404
