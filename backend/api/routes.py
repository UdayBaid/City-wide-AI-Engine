"""
API Routes — City-wide AI Engine
==================================
REST endpoints served by FastAPI:
  GET  /api/cameras           → Camera node statuses
  GET  /api/alerts            → Active alerts + historical incidents
  GET  /api/traffic           → Traffic flow, congestion, velocity distribution
  GET  /api/vehicles          → Vehicle database + ANPR records
  GET  /api/reports           → Available reports list
  POST /api/chat              → RAG-powered AI assistant
  GET  /api/health            → Health check
"""

import os
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types

from rag import retrieve

router = APIRouter(prefix="/api")

# ─── In-memory data store (mirrors mockData.js) ───────────────────────────────
# In production, replace these with real DB queries.

CAMERA_NODES = [
    {"id": "CAM-01", "name": "Connaught Place Outer Circle (Connected to Backend!)", "shortName": "Connaught Place", "lat": 28.6315, "lng": 77.2167, "status": "online", "fps": 30, "resolution": "1080P/60FPS", "todayReads": 19420, "accuracy": "96.4%", "lastSeen": "Just now", "direction": "Radial-North", "videoSrc": "/videos/camera1.mp4", "lastPlate": "DL01AB1044", "lastSpeed": 38, "vehicleCount": 1420},
    {"id": "CAM-02", "name": "India Gate C-Hexagon", "shortName": "India Gate", "lat": 28.6129, "lng": 77.2295, "status": "online", "fps": 30, "resolution": "4K/30FPS", "todayReads": 22180, "accuracy": "97.1%", "lastSeen": "Just now", "direction": "South-Circle", "videoSrc": "/videos/camera2.mp4", "lastPlate": "HR26BC4419", "lastSpeed": 42, "vehicleCount": 1890},
    {"id": "CAM-03", "name": "ITO Junction Mathura Road", "shortName": "ITO Junction", "lat": 28.6262, "lng": 77.2410, "status": "online", "fps": 30, "resolution": "1080P/30FPS", "todayReads": 31450, "accuracy": "95.8%", "lastSeen": "Just now", "direction": "East-Corridor", "videoSrc": "/videos/camera3.mp4", "lastPlate": "DL03CC8899", "lastSpeed": 29, "vehicleCount": 2450},
    {"id": "CAM-04", "name": "Karol Bagh Pusa Road", "shortName": "Karol Bagh", "lat": 28.6514, "lng": 77.1907, "status": "online", "fps": 30, "resolution": "1080P/30FPS", "todayReads": 16840, "accuracy": "94.9%", "lastSeen": "Just now", "direction": "West-Axial", "videoSrc": "/videos/camera4.mp4", "lastPlate": "UP16AK5522", "lastSpeed": 34, "vehicleCount": 1180},
    {"id": "CAM-05", "name": "AIIMS Flyover Ring Road", "shortName": "AIIMS Flyover", "lat": 28.5672, "lng": 77.2100, "status": "online", "fps": 30, "resolution": "4K/30FPS", "todayReads": 28910, "accuracy": "98.2%", "lastSeen": "Just now", "direction": "South-Radial", "videoSrc": "/videos/camera5.mp4", "lastPlate": "DL08CX9901", "lastSpeed": 52, "vehicleCount": 2210},
    {"id": "CAM-06", "name": "Dhaula Kuan Interchange", "shortName": "Dhaula Kuan", "lat": 28.5921, "lng": 77.1729, "status": "online", "fps": 30, "resolution": "1080P/60FPS", "todayReads": 24700, "accuracy": "96.7%", "lastSeen": "Just now", "direction": "Airport-Expressway", "videoSrc": "/videos/camera6.mp4", "lastPlate": "PB10XX1234", "lastSpeed": 50, "vehicleCount": 1960},
    {"id": "CAM-07", "name": "Lajpat Nagar Ring Road", "shortName": "Lajpat Nagar", "lat": 28.5677, "lng": 77.2436, "status": "offline", "fps": 0, "resolution": "1080P/30FPS", "todayReads": 4210, "accuracy": "0.0%", "lastSeen": "14 mins ago", "direction": "South-East", "videoSrc": "/videos/camera7.mp4", "lastPlate": "N/A", "lastSpeed": 0, "vehicleCount": 0},
    {"id": "CAM-08", "name": "Kashmiri Gate ISBT Junction", "shortName": "Kashmiri Gate", "lat": 28.6677, "lng": 77.2283, "status": "online", "fps": 30, "resolution": "1080P/60FPS", "todayReads": 27530, "accuracy": "96.1%", "lastSeen": "Just now", "direction": "North-Terminal", "videoSrc": "/videos/camera8.mp4", "lastPlate": "CH01TB9002", "lastSpeed": 92, "vehicleCount": 2130},
]

ACTIVE_ALERTS = [
    {"id": "ALT-901", "severity": "critical", "type": "Blacklist Hit", "title": "Blacklisted Vehicle — DL08CX9901 at AIIMS", "description": "NCR Crime Database Hit: Vehicle reported stolen in FIR #88219 (South Delhi). Intercept team notified.", "camera": "CAM-05 (AIIMS Flyover)", "timestamp": "2 mins ago", "status": "Active", "plate": "DL08CX9901", "speed": "52 km/h"},
    {"id": "ALT-902", "severity": "warning", "type": "Speed Violation", "title": "Severe Speeding — HR26DQ5521 85km/h", "description": "Speed radar detected 85 km/h in 50 km/h urban corridor. Automated e-Challan triggered.", "camera": "CAM-03 (ITO Junction)", "timestamp": "6 mins ago", "status": "Investigating", "plate": "HR26DQ5521", "speed": "85 km/h"},
    {"id": "ALT-903", "severity": "warning", "type": "Overspeed", "title": "Overspeed — CH01TB9002 at ISBT", "description": "Vehicle traveling at 92 km/h approaching North Terminal intersection zone.", "camera": "CAM-08 (Kashmiri Gate)", "timestamp": "12 mins ago", "status": "Active", "plate": "CH01TB9002", "speed": "92 km/h"},
    {"id": "ALT-904", "severity": "info", "type": "System Heartbeat", "title": "Camera Offline — CAM-07 Lajpat Nagar", "description": "Telemetry heartbeat timeout. Field maintenance team ticket #TK-4402 generated.", "camera": "CAM-07 (Lajpat Nagar)", "timestamp": "14 mins ago", "status": "Investigating", "plate": "N/A", "speed": "0 km/h"},
    {"id": "ALT-905", "severity": "info", "type": "Congestion Alert", "title": "High Density Congestion — ITO Junction", "description": "Corridor queue exceeds 450m on Vikas Marg westbound approach. Density Index: 88%.", "camera": "CAM-03 (ITO Junction)", "timestamp": "21 mins ago", "status": "Active", "plate": "N/A", "speed": "14 km/h"},
]

HISTORICAL_INCIDENTS = [
    {"id": "INC-881", "severity": "critical", "type": "Blacklist Hit", "description": "Stolen Scorpio flagged via OCR", "camera": "CAM-05 AIIMS", "timestamp": "Today 10:14", "status": "Resolved"},
    {"id": "INC-880", "severity": "warning", "type": "Wrong Way Driving", "description": "Two-wheeler contraflow on Outer Ring", "camera": "CAM-06 Dhaula Kuan", "timestamp": "Today 09:42", "status": "Resolved"},
    {"id": "INC-879", "severity": "warning", "type": "Speed Violation", "description": "Excess speed 98km/h on corridor", "camera": "CAM-08 Kashmiri Gate", "timestamp": "Today 09:15", "status": "Resolved"},
    {"id": "INC-878", "severity": "info", "type": "VIP Convoy Movement", "description": "Priority corridor clear protocol activated", "camera": "CAM-02 India Gate", "timestamp": "Today 08:30", "status": "Resolved"},
    {"id": "INC-877", "severity": "critical", "type": "Hit and Run", "description": "Commercial truck plate correlation ongoing", "camera": "CAM-04 Karol Bagh", "timestamp": "Today 07:11", "status": "Investigating"},
]

ANPR_RECORDS = [
    {"id": "REC-101", "plate": "PB10XX1234", "vehicleModel": "Hyundai Verna (White)", "camera": "CAM-06", "location": "Dhaula Kuan", "timestamp": "14:10:22", "speed": "50 km/h", "status": "Clear", "confidence": "98.4%"},
    {"id": "REC-102", "plate": "PB10XX1234", "vehicleModel": "Hyundai Verna (White)", "camera": "CAM-04", "location": "Karol Bagh", "timestamp": "14:22:45", "speed": "36 km/h", "status": "Clear", "confidence": "97.8%"},
    {"id": "REC-103", "plate": "DL08CX9901", "vehicleModel": "Mahindra Scorpio (Black)", "camera": "CAM-05", "location": "AIIMS Flyover", "timestamp": "14:51:19", "speed": "52 km/h", "status": "Blacklist", "confidence": "99.4%"},
    {"id": "REC-104", "plate": "HR26DQ5521", "vehicleModel": "Honda City (Silver)", "camera": "CAM-03", "location": "ITO Junction", "timestamp": "14:49:33", "speed": "85 km/h", "status": "Speeding", "confidence": "96.2%"},
    {"id": "REC-105", "plate": "CH01TB9002", "vehicleModel": "Toyota Fortuner (Grey)", "camera": "CAM-08", "location": "Kashmiri Gate", "timestamp": "14:47:11", "speed": "92 km/h", "status": "Speeding", "confidence": "95.5%"},
    {"id": "REC-106", "plate": "DL01AB1044", "vehicleModel": "Maruti Swift (Red)", "camera": "CAM-01", "location": "Connaught Place", "timestamp": "14:45:50", "speed": "38 km/h", "status": "Clear", "confidence": "98.0%"},
    {"id": "REC-107", "plate": "HR26BC4419", "vehicleModel": "Tata Nexon (Blue)", "camera": "CAM-02", "location": "India Gate", "timestamp": "14:44:12", "speed": "42 km/h", "status": "Clear", "confidence": "97.3%"},
    {"id": "REC-108", "plate": "UP16AK5522", "vehicleModel": "Kia Seltos (Dark Grey)", "camera": "CAM-04", "location": "Karol Bagh", "timestamp": "14:42:08", "speed": "34 km/h", "status": "Clear", "confidence": "96.8%"},
    {"id": "REC-109", "plate": "DL03CC8899", "vehicleModel": "BMW 3 Series (White)", "camera": "CAM-03", "location": "ITO Junction", "timestamp": "14:40:27", "speed": "29 km/h", "status": "Clear", "confidence": "98.7%"},
    {"id": "REC-110", "plate": "RJ14CW9021", "vehicleModel": "Mahindra Thar (Red)", "camera": "CAM-03", "location": "ITO Junction", "timestamp": "14:30:19", "speed": "78 km/h", "status": "Speeding", "confidence": "96.4%"},
]

VEHICLE_DATABASE = [
    {"plate": "PB10XX1234", "make": "Hyundai Verna", "color": "White", "type": "Sedan", "registeredCity": "Ludhiana, PB", "taxStatus": "Valid", "flag": "Under Tracking"},
    {"plate": "DL08CX9901", "make": "Mahindra Scorpio", "color": "Black", "type": "SUV", "registeredCity": "South Delhi, DL", "taxStatus": "Defaulter", "flag": "CRITICAL BLACKLIST"},
    {"plate": "HR26DQ5521", "make": "Honda City", "color": "Silver", "type": "Sedan", "registeredCity": "Gurugram, HR", "taxStatus": "Valid", "flag": "Speed Violator"},
    {"plate": "CH01TB9002", "make": "Toyota Fortuner", "color": "Grey", "type": "SUV", "registeredCity": "Chandigarh, CH", "taxStatus": "Valid", "flag": "Speed Violator"},
    {"plate": "DL01AB1044", "make": "Maruti Swift", "color": "Red", "type": "Hatchback", "registeredCity": "Central Delhi, DL", "taxStatus": "Valid", "flag": "Clear"},
    {"plate": "HR26BC4419", "make": "Tata Nexon", "color": "Blue", "type": "Compact SUV", "registeredCity": "Gurugram, HR", "taxStatus": "Valid", "flag": "Clear"},
    {"plate": "UP16AK5522", "make": "Kia Seltos", "color": "Dark Grey", "type": "SUV", "registeredCity": "Noida, UP", "taxStatus": "Valid", "flag": "Clear"},
    {"plate": "DL03CC8899", "make": "BMW 3 Series", "color": "White", "type": "Luxury Sedan", "registeredCity": "South Delhi, DL", "taxStatus": "Valid", "flag": "Clear"},
    {"plate": "RJ14CW9021", "make": "Mahindra Thar", "color": "Red", "type": "4x4 SUV", "registeredCity": "Jaipur, RJ", "taxStatus": "Valid", "flag": "Clear"},
]

TRAFFIC_FLOW_24H = [
    {"time": "00:00", "vehicles": 420, "avgSpeed": 58},
    {"time": "02:00", "vehicles": 230, "avgSpeed": 64},
    {"time": "04:00", "vehicles": 310, "avgSpeed": 62},
    {"time": "06:00", "vehicles": 890, "avgSpeed": 52},
    {"time": "08:00", "vehicles": 2450, "avgSpeed": 31},
    {"time": "09:00", "vehicles": 3420, "avgSpeed": 24},
    {"time": "10:00", "vehicles": 3890, "avgSpeed": 21},
    {"time": "12:00", "vehicles": 2950, "avgSpeed": 33},
    {"time": "14:00", "vehicles": 2780, "avgSpeed": 36},
    {"time": "16:00", "vehicles": 3350, "avgSpeed": 28},
    {"time": "18:00", "vehicles": 4120, "avgSpeed": 19},
    {"time": "19:00", "vehicles": 4380, "avgSpeed": 17},
    {"time": "20:00", "vehicles": 3620, "avgSpeed": 26},
    {"time": "22:00", "vehicles": 1980, "avgSpeed": 44},
    {"time": "23:59", "vehicles": 1120, "avgSpeed": 51},
]

CONGESTED_SEGMENTS = [
    {"route": "ITO → Vikas Marg", "congestion": 92, "speed": "14 km/h"},
    {"route": "AIIMS Flyover", "congestion": 84, "speed": "22 km/h"},
    {"route": "Kashmiri Gate → ISBT", "congestion": 79, "speed": "19 km/h"},
    {"route": "Connaught Place Outer", "congestion": 71, "speed": "27 km/h"},
    {"route": "Barakhamba Road", "congestion": 65, "speed": "30 km/h"},
]

REPORTS_LIST = [
    {"id": "REP-001", "title": "Daily Urban Traffic & Congestion Digest", "date": "2026-09-14 06:00", "format": "PDF", "size": "2.4 MB", "category": "Operations"},
    {"id": "REP-002", "title": "ANPR Hotlist Surveillance & Blacklist Hits", "date": "2026-09-14 05:30", "format": "PDF", "size": "1.1 MB", "category": "Law Enforcement"},
    {"id": "REP-003", "title": "Peak Hour Corridor Velocity Analysis", "date": "2026-09-13 23:59", "format": "CSV", "size": "4.8 MB", "category": "Analytics"},
    {"id": "REP-004", "title": "Weekly Camera Reliability & Downtime Audit", "date": "2026-09-13 18:00", "format": "PDF", "size": "3.2 MB", "category": "Infrastructure"},
    {"id": "REP-005", "title": "Speed Enforcement Violation Notice Export", "date": "2026-09-13 12:00", "format": "ZIP", "size": "5.6 MB", "category": "Enforcement"},
]


# ─── Pydantic Models ──────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    history: list[dict[str, str]] = []  # [{"role": "user"/"model", "parts": "..."}]


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict[str, Any]]
    timestamp: str


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@router.get("/cameras")
def get_cameras():
    return {"cameras": CAMERA_NODES, "total": len(CAMERA_NODES)}


@router.get("/alerts")
def get_alerts():
    return {
        "active": ACTIVE_ALERTS,
        "historical": HISTORICAL_INCIDENTS,
        "summary": {
            "critical": sum(1 for a in ACTIVE_ALERTS if a["severity"] == "critical"),
            "warning": sum(1 for a in ACTIVE_ALERTS if a["severity"] == "warning"),
            "info": sum(1 for a in ACTIVE_ALERTS if a["severity"] == "info"),
        }
    }


@router.get("/traffic")
def get_traffic():
    return {
        "flow24h": TRAFFIC_FLOW_24H,
        "congestedSegments": CONGESTED_SEGMENTS,
    }


@router.get("/vehicles")
def get_vehicles(plate: str | None = None):
    if plate:
        filtered_anpr = [r for r in ANPR_RECORDS if r["plate"].upper() == plate.upper()]
        filtered_veh = [v for v in VEHICLE_DATABASE if v["plate"].upper() == plate.upper()]
        return {"anprRecords": filtered_anpr, "vehicleDatabase": filtered_veh}
    return {"anprRecords": ANPR_RECORDS, "vehicleDatabase": VEHICLE_DATABASE}


@router.get("/reports")
def get_reports():
    return {"reports": REPORTS_LIST}


@router.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """
    RAG-powered AI assistant endpoint.
    1. Retrieves top-k relevant documents from FAISS index.
    2. Builds a system prompt with retrieved context.
    3. Calls Gemini LLM to generate a grounded answer.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured.")

    # Step 1: Retrieve relevant context
    docs = retrieve(req.message, top_k=4)
    context_blocks = []
    for doc in docs:
        context_blocks.append(f"[{doc['title']}]\n{doc['content']}")
    context_str = "\n\n---\n\n".join(context_blocks)

    # Step 2: Build system prompt
    system_prompt = f"""You are the AI Operations Assistant for the City-wide AI Traffic Surveillance Engine, 
a BEL (Bharat Electronics Limited) system deployed across Delhi for SIH 2026.
Your role is to help traffic operators with questions about protocols, camera statuses, 
vehicle tracking, alerts, and traffic management.

Use the following retrieved context from the operations manual to answer the operator's question.
If the context does not contain enough information, say so clearly — do not make up facts.

--- RETRIEVED CONTEXT ---
{context_str}
--- END CONTEXT ---

Guidelines:
- Be concise, professional, and actionable.
- Use bullet points for multi-step procedures.
- For critical incidents, always mention contacting the PCR (Police Control Room).
- If asked about a specific vehicle plate, camera, or alert — reference the exact data if available.
"""

    # Step 3: Call Gemini
    client = genai.Client(api_key=api_key)

    # Build conversation history for multi-turn chat
    contents = []
    for turn in req.history[-6:]:  # Keep last 6 turns for context window efficiency
        contents.append(
            types.Content(
                role=turn["role"],
                parts=[types.Part(text=turn["parts"])]
            )
        )
    # Add current user message
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part(text=req.message)]
        )
    )

    # Try primary model, then fallback, then raise friendly error
    models_to_try = ["gemini-3.6-flash", "gemini-1.5-flash"]
    response = None
    last_error = None

    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.3,
                    max_output_tokens=1024,
                )
            )
            break  # Success — stop trying
        except Exception as e:
            last_error = e
            error_str = str(e)
            # Only retry on 503/overload errors
            if "503" in error_str or "UNAVAILABLE" in error_str or "quota" in error_str.lower():
                continue
            # For other errors, raise immediately
            raise HTTPException(
                status_code=500,
                detail=f"Gemini API error: {error_str[:200]}"
            )

    if response is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "The Gemini AI model is currently experiencing high demand. "
                "Please wait a moment and try again. Your API key is valid and the backend is running."
            )
        )

    answer = response.text or "I was unable to generate a response. Please try again."

    return ChatResponse(
        answer=answer,
        sources=[{"title": d["title"], "topic": d["topic"], "score": d.get("score", 0)} for d in docs],
        timestamp=datetime.utcnow().isoformat(),
    )
