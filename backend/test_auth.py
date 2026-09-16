"""
Verification script for SQLite database authentication and security.
"""
import sys
import os

# Ensure backend directory in path
sys.path.insert(0, os.path.dirname(__file__))

from db.auth_db import (
    init_db,
    hash_password,
    verify_password,
    get_user_by_identifier,
    list_users
)

def run_tests():
    print(">>> 1. Initializing DB...")
    init_db()

    print(">>> 2. Listing users in DB...")
    users = list_users()
    print(f"Total seeded users: {len(users)}")
    for u in users:
        print(f" - [{u['role'].upper()}] {u['full_name']} ({u['username']} / {u['email']}) Badge: {u['badge_id']}")

    assert len(users) >= 3, "Expected at least 3 seeded accounts"

    print(">>> 3. Testing password hashing & constant-time verification...")
    pw = "SecretTrafficPass@2026!"
    hashed = hash_password(pw)
    assert verify_password(pw, hashed) is True, "Password verification failed"
    assert verify_password("WrongPassword", hashed) is False, "Wrong password accepted!"
    print("Hashing & verification verified successfully.")

    print(">>> 4. Testing Admin credentials...")
    admin = get_user_by_identifier("admin@traffic.gov.in")
    assert admin is not None, "Admin user not found by email"
    assert admin["role"] == "admin"
    assert verify_password("Admin@2026!DRx", admin["password_hash"]) is True
    print("Admin verification passed.")

    print(">>> 5. Testing Operator credentials...")
    op = get_user_by_identifier("operator")
    assert op is not None, "Operator user not found by username"
    assert op["role"] == "operator"
    assert verify_password("Operator@2026!DRx", op["password_hash"]) is True
    print("Operator verification passed.")

    print(">>> 6. Testing Analyst credentials...")
    analyst = get_user_by_identifier("analyst@traffic.gov.in")
    assert analyst is not None, "Analyst user not found by email"
    assert analyst["role"] == "analyst"
    assert verify_password("Analyst@2026!DRx", analyst["password_hash"]) is True
    print("Analyst verification passed.")

    print("\n ALL AUTH DATABASE TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
