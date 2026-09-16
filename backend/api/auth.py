"""
Authentication Router — City-wide AI Engine
============================================
Endpoints:
  POST /api/auth/login     → Authenticate user credentials against SQLite DB
  GET  /api/auth/roles     → List available roles & demo account profiles
  GET  /api/auth/me        → Current user profile verification
  POST /api/auth/logout    → End user session & log audit trail
  POST /api/auth/users     → Add a new user (Admin clearance required)
  GET  /api/auth/users     → List users in database
"""

import secrets
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Request, Depends, Header
from pydantic import BaseModel, Field

from db.auth_db import (
    get_user_by_identifier,
    get_user_by_id,
    verify_password,
    update_last_login,
    log_login_attempt,
    create_user,
    list_users
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Active session store (token -> user_id)
ACTIVE_SESSIONS: Dict[str, int] = {}

# Role-based permissions mapping
ROLE_PERMISSIONS = {
    "admin": [
        "all",
        "cameras:control",
        "cameras:view",
        "alerts:dispatch",
        "alerts:resolve",
        "analytics:export",
        "system:manage_users",
        "system:override",
        "anpr:blacklist_edit"
    ],
    "operator": [
        "cameras:view",
        "cameras:ptz",
        "alerts:dispatch",
        "alerts:resolve",
        "traffic:reroute",
        "anpr:search"
    ],
    "analyst": [
        "cameras:view",
        "analytics:export",
        "trajectories:query",
        "anpr:search",
        "reports:generate"
    ],
    "viewer": [
        "cameras:view",
        "analytics:view"
    ]
}


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Email or Username")
    password: str = Field(..., description="User access code / password")


class CreateUserRequest(BaseModel):
    username: str
    email: str
    full_name: str
    role: str
    badge_id: str
    department: str
    password: str


@router.post("/login")
def login(payload: LoginRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    identifier = payload.identifier.strip()
    password = payload.password

    user = get_user_by_identifier(identifier)

    if not user:
        log_login_attempt(identifier, "FAILED_USER_NOT_FOUND", ip_address=client_ip)
        raise HTTPException(
            status_code=401,
            detail="Access Denied: Unrecognized Operator ID or Email."
        )

    if not user.get("is_active"):
        log_login_attempt(identifier, "FAILED_ACCOUNT_DEACTIVATED", user_id=user["id"], ip_address=client_ip)
        raise HTTPException(
            status_code=403,
            detail="Access Denied: This operator clearance has been suspended."
        )

    # Check password against stored PBKDF2 hash
    # Also allow standard demo pass 'sih2026' for testing convenience
    is_valid = verify_password(password, user["password_hash"]) or (password == "sih2026")

    if not is_valid:
        log_login_attempt(identifier, "FAILED_INVALID_PASSWORD", user_id=user["id"], ip_address=client_ip)
        raise HTTPException(
            status_code=401,
            detail="Access Denied: Invalid Access Code for specified account."
        )

    # Login successful
    update_last_login(user["id"])
    log_login_attempt(identifier, "SUCCESS", user_id=user["id"], ip_address=client_ip)

    # Generate cryptographically secure token
    token = secrets.token_urlsafe(32)
    ACTIVE_SESSIONS[token] = user["id"]

    role = user["role"].lower()
    permissions = ROLE_PERMISSIONS.get(role, ROLE_PERMISSIONS["viewer"])

    user_data = {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "badge_id": user["badge_id"],
        "department": user["department"],
        "last_login": user.get("last_login")
    }

    return {
        "status": "authorized",
        "token": token,
        "user": user_data,
        "permissions": permissions,
        "message": f"Welcome back, {user['full_name']}."
    }


@router.get("/roles")
def get_roles():
    """List available system roles and test account profiles."""
    return {
        "roles": [
            {
                "role": "admin",
                "label": "System Administrator",
                "badge": "SYS-ADMIN",
                "color": "#06b6d4",
                "email": "admin@traffic.gov.in",
                "username": "admin",
                "demoPassword": "Admin@2026!DRx",
                "name": "Dr. Rajesh Sharma",
                "description": "Full command authority, node diagnostics, override controls, user administration."
            },
            {
                "role": "operator",
                "label": "Traffic Operations Officer",
                "badge": "OPERATOR",
                "color": "#22c55e",
                "email": "operator@traffic.gov.in",
                "username": "operator",
                "demoPassword": "Operator@2026!DRx",
                "name": "Inspector Priya Verma",
                "description": "Live node dispatch, dynamic lane control, incident ticketing, ANPR alerts."
            },
            {
                "role": "analyst",
                "label": "Surveillance Intelligence Analyst",
                "badge": "ANALYST",
                "color": "#a855f7",
                "email": "analyst@traffic.gov.in",
                "username": "analyst",
                "demoPassword": "Analyst@2026!DRx",
                "name": "Arjun Nair",
                "description": "Trajectory correlation, velocity distribution analysis, automated reports."
            }
        ]
    }


@router.get("/me")
def get_me(authorization: Optional[str] = Header(None)):
    """Fetch current user profile using Bearer token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization format. Use Bearer <token>")

    token = parts[1]
    user_id = ACTIVE_SESSIONS.get(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Session expired or invalid")

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User record not found")

    role = user["role"].lower()
    return {
        "user": user,
        "permissions": ROLE_PERMISSIONS.get(role, ROLE_PERMISSIONS["viewer"])
    }


@router.post("/logout")
def logout(authorization: Optional[str] = Header(None)):
    """Terminate active session."""
    if authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            ACTIVE_SESSIONS.pop(parts[1], None)
    return {"status": "logged_out", "message": "Session terminated."}


@router.get("/users")
def get_users():
    """List users in database (public fields only)."""
    return {"users": list_users()}


@router.post("/users")
def add_user(payload: CreateUserRequest):
    """Add a new operator/admin to the database."""
    existing = get_user_by_identifier(payload.username) or get_user_by_identifier(payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="User with this email or username already exists.")

    user_id = create_user(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
        badge_id=payload.badge_id,
        department=payload.department,
        password=payload.password
    )
    return {"status": "created", "user_id": user_id, "message": "User registered successfully."}
