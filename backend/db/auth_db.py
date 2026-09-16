"""
Authentication Database & Cryptographic Security Module
========================================================
Handles:
- SQLite persistent storage for users, roles, badges, and audit logs.
- PBKDF2-HMAC-SHA256 password hashing with random per-user salt.
- Timing-attack resistant constant-time credential verification.
- Pre-seeding distinct role accounts (Admin, Operator, Analyst).
"""

import os
import sqlite3
import hashlib
import secrets
import hmac
from datetime import datetime
from typing import Optional, Dict, Any, List

# Path to database file
DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
DB_PATH = os.path.join(DB_DIR, "traffic_command.db")

# Iterations for PBKDF2
PBKDF2_ITERATIONS = 150_000


def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with 16-byte random salt."""
    salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        PBKDF2_ITERATIONS
    ).hex()
    return f"{salt}${pw_hash}"


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verify password against stored salt$hash with timing-attack mitigation."""
    try:
        salt, expected_hash = stored_hash.split('$', 1)
        actual_hash = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            PBKDF2_ITERATIONS
        ).hex()
        return hmac.compare_digest(actual_hash, expected_hash)
    except Exception:
        return False


def get_db_connection() -> sqlite3.Connection:
    """Get a SQLite connection with Row factory enabled."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables if they don't exist and seed default accounts."""
    os.makedirs(DB_DIR, exist_ok=True)
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT NOT NULL,
                badge_id TEXT NOT NULL,
                department TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                last_login TEXT
            )
        """)

        # Login audit logs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS login_audit (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                identifier TEXT NOT NULL,
                status TEXT NOT NULL,
                ip_address TEXT,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        conn.commit()

        # Check if users already exist
        cursor.execute("SELECT COUNT(*) as count FROM users")
        count = cursor.fetchone()["count"]

        if count == 0:
            # Seed default distinct accounts
            seed_users = [
                {
                    "username": "admin",
                    "email": "admin@traffic.gov.in",
                    "full_name": "Dr. Rajesh Sharma",
                    "role": "admin",
                    "badge_id": "ADM-001",
                    "department": "Directorate of Traffic Control & AI Command",
                    "passwords": ["Admin@2026!DRx", "sih2026"]  # Seed with Admin@2026!DRx
                },
                {
                    "username": "operator",
                    "email": "operator@traffic.gov.in",
                    "full_name": "Inspector Priya Verma",
                    "role": "operator",
                    "badge_id": "OPS-104",
                    "department": "Real-Time Surveillance & Quick Response Team",
                    "passwords": ["Operator@2026!DRx", "sih2026"]  # Seed with Operator@2026!DRx
                },
                {
                    "username": "analyst",
                    "email": "analyst@traffic.gov.in",
                    "full_name": "Arjun Nair",
                    "role": "analyst",
                    "badge_id": "ANA-209",
                    "department": "Traffic Flow Intelligence & ANPR Analytics",
                    "passwords": ["Analyst@2026!DRx", "sih2026"]  # Seed with Analyst@2026!DRx
                }
            ]

            now = datetime.utcnow().isoformat()
            for u in seed_users:
                # Primary secure password for initial seed
                primary_pw = u["passwords"][0]
                cursor.execute("""
                    INSERT INTO users (username, email, full_name, role, badge_id, department, password_hash, is_active, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
                """, (
                    u["username"],
                    u["email"],
                    u["full_name"],
                    u["role"],
                    u["badge_id"],
                    u["department"],
                    hash_password(primary_pw),
                    now
                ))
            conn.commit()
            print(f"[AUTH_DB] Initialized database at {DB_PATH} with 3 distinct role accounts.")


def get_user_by_identifier(identifier: str) -> Optional[Dict[str, Any]]:
    """Fetch user by either email or username."""
    identifier_clean = identifier.strip().lower()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM users 
            WHERE LOWER(email) = ? OR LOWER(username) = ?
        """, (identifier_clean, identifier_clean))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None


def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Fetch user by ID (excludes password hash in returned dict)."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, username, email, full_name, role, badge_id, department, is_active, created_at, last_login 
            FROM users WHERE id = ?
        """, (user_id,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None


def update_last_login(user_id: int):
    """Update last_login timestamp for a user."""
    now = datetime.utcnow().isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET last_login = ? WHERE id = ?", (now, user_id))
        conn.commit()


def log_login_attempt(identifier: str, status: str, user_id: Optional[int] = None, ip_address: Optional[str] = None):
    """Record login audit trail."""
    now = datetime.utcnow().isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO login_audit (user_id, identifier, status, ip_address, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, identifier, status, ip_address, now))
        conn.commit()


def create_user(username: str, email: str, full_name: str, role: str, badge_id: str, department: str, password: str) -> int:
    """Insert a new user with securely hashed password."""
    now = datetime.utcnow().isoformat()
    pw_hash = hash_password(password)
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (username, email, full_name, role, badge_id, department, password_hash, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
        """, (username.strip().lower(), email.strip().lower(), full_name.strip(), role.strip().lower(), badge_id.strip(), department.strip(), pw_hash, now))
        conn.commit()
        return cursor.lastrowid


def list_users() -> List[Dict[str, Any]]:
    """List all users without exposing password hashes."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, username, email, full_name, role, badge_id, department, is_active, created_at, last_login 
            FROM users ORDER BY id ASC
        """)
        return [dict(r) for r in cursor.fetchall()]
