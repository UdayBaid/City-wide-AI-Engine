import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from api.stream import router as stream_router
from api.auth import router as auth_router
from rag.engine import build_index
from db.auth_db import init_db

load_dotenv(override=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: initialize auth SQLite database and build RAG vector index."""
    try:
        init_db()
        print("[INFO] Auth database initialized.")
    except Exception as e:
        print(f"[ERROR] Failed to initialize auth database: {e}")

    api_key = os.getenv("GEMINI_API_KEY")
    if api_key and api_key != "your_gemini_api_key_here":
        try:
            build_index()
        except Exception as e:
            with open("error.log", "w") as f:
                import traceback
                f.write(traceback.format_exc())
            print(f"[WARNING] Failed to build RAG index due to API error: {e}")
            print("   The server will start, but the AI Assistant may fail to answer.")
    else:
        print("[WARNING] GEMINI_API_KEY not set. RAG /api/chat endpoint will not work.")
        print("   Edit backend/.env and add your Gemini API key.")
    yield


app = FastAPI(
    title="City-wide AI Engine API",
    description="FastAPI backend for the City-Wide AI Traffic Surveillance System (SIH 2026). Provides REST endpoints, secure SQLite database authentication, and an RAG-powered AI assistant.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(auth_router)
app.include_router(stream_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "City-wide AI Engine API is running 🚦",
        "docs": "/docs",
        "endpoints": [
            "GET  /api/health",
            "POST /api/auth/login",
            "GET  /api/auth/roles",
            "GET  /api/auth/me",
            "POST /api/auth/logout",
            "GET  /api/cameras",
            "GET  /api/stream/{camera_id}",
            "GET  /api/frame/{camera_id}",
            "GET  /api/stream/status",
            "GET  /api/alerts",
            "GET  /api/traffic",
            "GET  /api/vehicles",
            "GET  /api/trajectories",
            "GET  /api/reports",
            "POST /api/chat",
        ]
    }
