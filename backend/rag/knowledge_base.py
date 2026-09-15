"""
City-wide AI Engine — RAG Knowledge Base
=========================================
This file contains the structured domain knowledge for the traffic surveillance
system. The RAG model will use this to answer operator queries.

Each document has a 'topic', 'title', and 'content' field.
Add new documents here to expand the system's knowledge.
"""

KNOWLEDGE_BASE = [
    # ---- Camera Operations ----
    {
        "topic": "cameras",
        "title": "Camera Network Overview",
        "content": (
            "The city surveillance network comprises 8 ANPR (Automatic Number Plate Recognition) camera nodes "
            "deployed at strategic traffic intersections across Delhi. Cameras are identified by IDs CAM-01 to CAM-08. "
            "Each camera captures video at 1080P/30FPS or 4K/30FPS resolution. The system operates 24/7. "
            "Locations include: Connaught Place Outer Circle (CAM-01), India Gate C-Hexagon (CAM-02), "
            "ITO Junction Mathura Road (CAM-03), Karol Bagh Pusa Road (CAM-04), AIIMS Flyover Ring Road (CAM-05), "
            "Dhaula Kuan Interchange (CAM-06), Lajpat Nagar Ring Road (CAM-07), Kashmiri Gate ISBT Junction (CAM-08)."
        )
    },
    {
        "topic": "cameras",
        "title": "Camera Offline Response Protocol",
        "content": (
            "When a camera goes offline (no telemetry heartbeat for more than 5 minutes), the system auto-generates "
            "a field maintenance ticket. The operator must: "
            "1. Verify the outage via the Live Cameras dashboard. "
            "2. Check for a known network outage in that zone. "
            "3. If outage persists beyond 15 mins, dispatch a field maintenance team. "
            "4. Log the incident in the system as 'Infrastructure — Camera Offline'. "
            "CAM-07 (Lajpat Nagar) has historically experienced the most downtime due to power fluctuations."
        )
    },
    # ---- Alerts & Incidents ----
    {
        "topic": "alerts",
        "title": "Alert Severity Levels",
        "content": (
            "Alerts are classified into three severity levels: "
            "CRITICAL — Blacklisted vehicles, armed suspects, stolen vehicles, hit-and-run suspects. Requires immediate police dispatch. "
            "WARNING — Speed violations above 20 km/h over the limit, wrong-way driving, red light jumps, congestion index above 85%. Triggers automated e-Challan or field notification. "
            "INFO — Camera status changes, congestion alerts below 85%, VIP convoy movements, system heartbeat messages. Requires operator acknowledgement only."
        )
    },
    {
        "topic": "alerts",
        "title": "Blacklisted Vehicle Interception Protocol",
        "content": (
            "When a CRITICAL blacklist alert fires: "
            "1. Immediately note the vehicle plate, last known camera, speed, and direction. "
            "2. Alert the nearest police control room (PCR) with vehicle details. "
            "3. Activate trajectory tracking to predict the vehicle's route. "
            "4. Coordinate with all downstream camera operators (cameras along the predicted route). "
            "5. Do NOT allow civilian personnel to intercept the vehicle directly. "
            "6. Update alert status to 'Investigating' once PCR is notified. "
            "7. Mark as 'Resolved' only after confirmation of interception or loss of track. "
            "FIR cross-referencing is performed automatically against the NCR Crime Database."
        )
    },
    {
        "topic": "alerts",
        "title": "Speed Violation Enforcement",
        "content": (
            "Speed violations are detected when a vehicle exceeds the zone speed limit by more than 10 km/h. "
            "Urban corridor limit: 50 km/h. Flyover limit: 60 km/h. School zones: 30 km/h. "
            "When a violation is detected: "
            "1. The system automatically generates an e-Challan linked to the plate's registered owner in the RTO database. "
            "2. Alerts are raised as WARNING for speeds 10-30 km/h over limit. "
            "3. Alerts are raised as CRITICAL if speed exceeds 40 km/h over limit or the plate is on the blacklist. "
            "Repeat violators (3+ violations in 30 days) are flagged for license suspension referral."
        )
    },
    # ---- Traffic Management ----
    {
        "topic": "traffic",
        "title": "Peak Hour Congestion Management",
        "content": (
            "Peak traffic hours in Delhi are 8 AM to 11 AM (morning peak) and 5 PM to 9 PM (evening peak) on weekdays. "
            "The most congested corridors are: ITO → Vikas Marg (congestion index up to 92%), "
            "AIIMS Flyover (84%), Kashmiri Gate → ISBT (79%), Connaught Place Outer Circle (71%), Barakhamba Road (65%). "
            "During congestion index above 80%, the system recommends activating the Variable Message Signs (VMS) "
            "on approach roads to redirect traffic to alternate routes."
        )
    },
    {
        "topic": "traffic",
        "title": "VIP Convoy Protocol",
        "content": (
            "When a VIP convoy movement is expected: "
            "1. Receive advance notification from the VIP security detail (minimum 30 mins notice). "
            "2. Activate 'Priority Corridor Clear' protocol on affected cameras. "
            "3. Coordinate with traffic police to hold cross-traffic at key junctions. "
            "4. Monitor convoy movement on the Live Cameras feed. "
            "5. Clear protocol is automatically deactivated 10 minutes after the convoy clears the last monitored camera. "
            "6. Log the event as 'INFO — VIP Convoy Movement'."
        )
    },
    # ---- ANPR / Vehicles ----
    {
        "topic": "anpr",
        "title": "ANPR System Accuracy",
        "content": (
            "The ANPR (Automatic Number Plate Recognition) system achieves an average accuracy of 96.5% across all nodes. "
            "CAM-05 (AIIMS Flyover) has the highest accuracy at 98.2% due to optimal lighting and camera angle. "
            "CAM-07 (Lajpat Nagar) has the lowest accuracy during operational periods at 94.9%. "
            "Accuracy drops during heavy rain, fog, and night hours (11 PM to 5 AM) by approximately 3-5%. "
            "All plates with confidence below 90% are flagged for manual review by an operator."
        )
    },
    {
        "topic": "anpr",
        "title": "Vehicle Trajectory Tracking",
        "content": (
            "Trajectory tracking allows operators to reconstruct the complete path of a specific vehicle "
            "across the camera network based on its number plate. "
            "To initiate a trajectory search: enter the target plate number in the Trajectories page. "
            "The system correlates ANPR records across all cameras and displays the route on the city map. "
            "Trajectory data is retained for 90 days. Cross-city correlation with adjoining state systems "
            "(Haryana, UP, Rajasthan) is available via the VAHAN-Link API for blacklisted vehicles."
        )
    },
    # ---- System / Reports ----
    {
        "topic": "reports",
        "title": "Available Report Types",
        "content": (
            "The system generates the following automated reports: "
            "Daily Urban Traffic & Congestion Digest (PDF, generated at 06:00 daily) — summarizes vehicle counts, "
            "average speeds, and congestion indices for all corridors. "
            "ANPR Hotlist Surveillance & Blacklist Hits (PDF, 05:30 daily) — lists all critical alerts from the previous 24 hours. "
            "Peak Hour Corridor Velocity Analysis (CSV, 23:59 daily) — raw speed and volume data per corridor per hour. "
            "Weekly Camera Reliability & Downtime Audit (PDF, 18:00 Sundays) — uptime statistics for each camera node. "
            "Speed Enforcement Violation Notice Export (ZIP, 12:00 daily) — challan data for forwarding to RTO."
        )
    },
    {
        "topic": "system",
        "title": "System Architecture",
        "content": (
            "The City-wide AI Engine is built on a multi-tier architecture. "
            "Frontend: React.js dashboard served on port 3000 or 3002, providing real-time visualization of cameras, alerts, and analytics. "
            "Backend: FastAPI Python server running on port 8000, providing REST API endpoints and the RAG AI assistant. "
            "AI Pipeline: YOLOv8 (object detection) + ByteTrack (multi-object tracking) running on GPU nodes for real-time video analysis. "
            "Database: Camera feeds processed in-stream; ANPR records stored in a time-series database. "
            "The RAG model uses Google Gemini embeddings with a FAISS vector store for semantic document retrieval."
        )
    },
]
