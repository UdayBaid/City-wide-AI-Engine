"""
Test FastAPI authentication endpoints using TestClient.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from starlette.testclient import TestClient
from main import app
from db.auth_db import init_db

def test_api():
    init_db()
    client = TestClient(app)

    print(">>> 1. Testing GET /api/auth/roles...")
    res = client.get("/api/auth/roles")
    assert res.status_code == 200, f"Roles failed: {res.text}"
    roles = res.json()["roles"]
    assert len(roles) >= 3, "Expected 3 roles"
    print(f"Roles returned: {[r['role'] for r in roles]}")

    print(">>> 2. Testing POST /api/auth/login for ADMIN...")
    res = client.post("/api/auth/login", json={
        "identifier": "admin@traffic.gov.in",
        "password": "Admin@2026!DRx"
    })
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    data = res.json()
    assert data["status"] == "authorized"
    assert data["user"]["role"] == "admin"
    admin_token = data["token"]
    print(f"Admin login success: token={admin_token[:10]}..., name={data['user']['full_name']}")

    print(">>> 3. Testing GET /api/auth/me with Admin token...")
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200, f"Auth me failed: {res.text}"
    assert res.json()["user"]["email"] == "admin@traffic.gov.in"
    print("GET /api/auth/me succeeded.")

    print(">>> 4. Testing POST /api/auth/login for OPERATOR...")
    res = client.post("/api/auth/login", json={
        "identifier": "operator",
        "password": "Operator@2026!DRx"
    })
    assert res.status_code == 200, f"Operator login failed: {res.text}"
    data = res.json()
    assert data["user"]["role"] == "operator"
    assert data["user"]["badge_id"] == "OPS-104"
    print(f"Operator login success: name={data['user']['full_name']}")

    print(">>> 5. Testing POST /api/auth/login for ANALYST...")
    res = client.post("/api/auth/login", json={
        "identifier": "analyst@traffic.gov.in",
        "password": "Analyst@2026!DRx"
    })
    assert res.status_code == 200, f"Analyst login failed: {res.text}"
    data = res.json()
    assert data["user"]["role"] == "analyst"
    assert data["user"]["badge_id"] == "ANA-209"
    print(f"Analyst login success: name={data['user']['full_name']}")

    print(">>> 6. Testing Invalid Password Rejection (401)...")
    res = client.post("/api/auth/login", json={
        "identifier": "admin@traffic.gov.in",
        "password": "WrongPassword123"
    })
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"
    print("Invalid password rejected with 401 Unauthorized.")

    print(">>> 7. Testing Unknown User Rejection (401)...")
    res = client.post("/api/auth/login", json={
        "identifier": "intruder@fake.com",
        "password": "some_password"
    })
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"
    print("Unknown user rejected with 401 Unauthorized.")

    print(">>> 8. Testing Logout...")
    res = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    print("Logout succeeded.")

    print("\n ALL FASTAPI AUTH ENDPOINT TESTS PASSED!")

if __name__ == "__main__":
    test_api()
