#!/usr/bin/env python
"""
Quick start script for the City-wide AI Engine backend.
Activates the venv and runs uvicorn.

Usage (from backend/ directory):
    python start.py
"""
import subprocess, sys, os

venv_python = os.path.join(os.path.dirname(__file__), "venv", "Scripts", "python.exe")

if not os.path.exists(venv_python):
    print("❌ Virtual environment not found. Please run:")
    print("   python -m venv venv")
    print("   venv\\Scripts\\pip install -r requirements.txt")
    sys.exit(1)

print("🚀 Starting City-wide AI Engine FastAPI backend on http://localhost:8000")
print("📄 Swagger UI available at http://localhost:8000/docs\n")

subprocess.run([
    venv_python, "-m", "uvicorn", "main:app",
    "--reload", "--host", "0.0.0.0", "--port", "8000"
])
