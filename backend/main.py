"""
City-wide AI Engine — FastAPI Main Entry Point
===============================================
Run with:
    uvicorn main:app --reload --port 8000

Or use the start script:
    python start.py
"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from rag.engine import build_index

# Load environment variables from .env file
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: build the RAG vector index. Shutdown: nothing to clean up."""
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key and api_key != "your_gemini_api_key_here":
        try:
            build_index()
        except Exception as e:
            print(f"⚠️  WARNING: Failed to build RAG index due to API error: {e}")
            print("   The server will start, but the AI Assistant may fail to answer.")
    else:
        print("⚠️  WARNING: GEMINI_API_KEY not set. RAG /api/chat endpoint will not work.")
        print("   Edit backend/.env and add your Gemini API key.")
    yield


app = FastAPI(
    title="City-wide AI Engine API",
    description="FastAPI backend for the BEL Traffic Surveillance System (SIH 2026). Provides REST endpoints and an RAG-powered AI assistant.",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
# Allow the React frontend (running on port 3000 or 3002) to call this API.
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

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "City-wide AI Engine API is running 🚦",
        "docs": "/docs",
        "endpoints": [
            "GET  /api/health",
            "GET  /api/cameras",
            "GET  /api/alerts",
            "GET  /api/traffic",
            "GET  /api/vehicles",
            "GET  /api/reports",
            "POST /api/chat",
        ]
    }
