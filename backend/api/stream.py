"""
Camera Video & Frame Streaming Engine
=====================================
Provides live MJPEG video streams and single-frame snapshots
for all surveillance cameras in the City-wide AI Engine.

Endpoints:
  GET /api/stream/{camera_id}  -> Live multipart/x-mixed-replace MJPEG stream
  GET /api/frame/{camera_id}   -> Single JPEG snapshot
  GET /api/stream/status       -> Stream engine status and camera endpoints
"""

import os
import time
from pathlib import Path
from typing import Generator
import cv2
import numpy as np
from fastapi import APIRouter, Response
from fastapi.responses import StreamingResponse

router = APIRouter()


BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRAMES_DIR = BASE_DIR / "frames_small" / "vdo"

FRAME_FILES = []
if FRAMES_DIR.exists():
    FRAME_FILES = sorted(
        [p for p in FRAMES_DIR.glob("*.jpg") if p.is_file()],
        key=lambda x: x.name
    )

TOTAL_FRAMES = len(FRAME_FILES)

CAMERA_STREAM_PROFILES = {
    "CAM-01": {
        "name": "Connaught Place",
        "direction": "Radial-North",
        "plate": "DL01AB1044",
        "speed": 38,
        "offset": 0,
        "status": "online",
        "resolution": "1080P/60FPS",
        "coords": (28.6315, 77.2167),
        "bbox": [(160, 140, 290, 240)],
    },
    "CAM-02": {
        "name": "India Gate",
        "direction": "South-Circle",
        "plate": "HR26BC4419",
        "speed": 42,
        "offset": 125,
        "status": "online",
        "resolution": "4K/30FPS",
        "coords": (28.6129, 77.2295),
        "bbox": [(320, 160, 460, 270)],
    },
    "CAM-03": {
        "name": "ITO Junction",
        "direction": "East-Corridor",
        "plate": "DL03CC8899",
        "speed": 29,
        "offset": 250,
        "status": "online",
        "resolution": "1080P/30FPS",
        "coords": (28.6262, 77.2410),
        "bbox": [(120, 180, 240, 280)],
    },
    "CAM-04": {
        "name": "Karol Bagh",
        "direction": "West-Axial",
        "plate": "UP16AK5522",
        "speed": 34,
        "offset": 375,
        "status": "online",
        "resolution": "1080P/30FPS",
        "coords": (28.6514, 77.1907),
        "bbox": [(260, 150, 400, 260)],
    },
    "CAM-05": {
        "name": "AIIMS Flyover",
        "direction": "South-Radial",
        "plate": "DL08CX9901",
        "speed": 52,
        "offset": 500,
        "status": "online",
        "resolution": "4K/30FPS",
        "coords": (28.5672, 77.2100),
        "bbox": [(210, 170, 360, 280)],
    },
    "CAM-06": {
        "name": "Dhaula Kuan",
        "direction": "Airport-Expressway",
        "plate": "PB10XX1234",
        "speed": 50,
        "offset": 625,
        "status": "online",
        "resolution": "1080P/60FPS",
        "coords": (28.5921, 77.1729),
        "bbox": [(340, 150, 490, 260)],
    },
    "CAM-07": {
        "name": "Lajpat Nagar",
        "direction": "South-East",
        "plate": "N/A",
        "speed": 0,
        "offset": 0,
        "status": "offline",
        "resolution": "1080P/30FPS",
        "coords": (28.5677, 77.2436),
        "bbox": [],
    },
    "CAM-08": {
        "name": "Kashmiri Gate",
        "direction": "North-Terminal",
        "plate": "CH01TB9002",
        "speed": 92,
        "offset": 750,
        "status": "online",
        "resolution": "1080P/60FPS",
        "coords": (28.6677, 77.2283),
        "bbox": [(190, 130, 340, 240)],
    },
}



def render_offline_frame(camera_id: str, width: int = 640, height: int = 360) -> np.ndarray:
    """Generates an authentic CCTV offline static / loss-of-signal screen."""
    frame = np.random.randint(15, 35, (height, width, 3), dtype=np.uint8)

    frame[::4, :] = np.clip(frame[::4, :].astype(int) - 10, 0, 255).astype(np.uint8)

    cv2.rectangle(frame, (20, 20), (width - 20, height - 20), (0, 140, 255), 2)

    cv2.putText(frame, "SIGNAL LOSS — HEARTBEAT TIMEOUT", (60, height // 2 - 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 180, 255), 2, cv2.LINE_AA)
    cv2.putText(frame, f"FEED: {camera_id} · LAJPAT NAGAR RING ROAD", (60, height // 2 + 15),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1, cv2.LINE_AA)
    cv2.putText(frame, "DISPATCH TICKET: #TK-4402 (PENDING MAINTENANCE)", (60, height // 2 + 45),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 200, 255), 1, cv2.LINE_AA)

    curr_time = time.strftime("%Y-%m-%d %H:%M:%S UTC+05:30")
    cv2.putText(frame, curr_time, (25, height - 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (100, 100, 100), 1, cv2.LINE_AA)

    return frame


def render_hud_overlay(frame: np.ndarray, profile: dict, camera_id: str, frame_num: int) -> np.ndarray:
    """Overlays high-tech surveillance telemetry, ANPR tags, and neural bounding boxes."""
    h, w = frame.shape[:2]

    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 32), (8, 12, 22), -1)
    cv2.rectangle(overlay, (0, h - 26), (w, h), (8, 12, 22), -1)
    cv2.addWeighted(overlay, 0.75, frame, 0.25, 0, frame)

    cam_name = profile.get("name", camera_id)
    cam_dir = profile.get("direction", "")
    cv2.putText(frame, f"[{camera_id}] {cam_name.upper()} ({cam_dir})", (10, 21),
                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (6, 182, 212), 1, cv2.LINE_AA)

    pulse = int(time.time() * 2) % 2 == 0
    dot_color = (0, 0, 255) if pulse else (0, 0, 160)
    cv2.circle(frame, (w - 170, 16), 5, dot_color, -1)
    cv2.putText(frame, "LIVE REC", (w - 158, 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.42, (241, 245, 249), 1, cv2.LINE_AA)
    cv2.putText(frame, "YOLOv8·AI", (w - 78, 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.42, (34, 197, 94), 1, cv2.LINE_AA)

    bboxes = profile.get("bbox", [])
    plate = profile.get("plate", "DL01AB1044")
    speed = profile.get("speed", 40)

    for i, (x1, y1, x2, y2) in enumerate(bboxes):
        scale_x = w / 640.0
        scale_y = h / 360.0
        bx1, by1 = int(x1 * scale_x), int(y1 * scale_y)
        bx2, by2 = int(x2 * scale_x), int(y2 * scale_y)

        color = (0, 215, 255) if "BLACKLIST" not in plate else (0, 0, 255)
        cv2.rectangle(frame, (bx1, by1), (bx2, by2), color, 1)

        c_len = 12
        cv2.line(frame, (bx1, by1), (bx1 + c_len, by1), (0, 255, 255), 2)
        cv2.line(frame, (bx1, by1), (bx1, by1 + c_len), (0, 255, 255), 2)
        cv2.line(frame, (bx2, by1), (bx2 - c_len, by1), (0, 255, 255), 2)
        cv2.line(frame, (bx2, by1), (bx2, by1 + c_len), (0, 255, 255), 2)
        cv2.line(frame, (bx1, by2), (bx1 + c_len, by2), (0, 255, 255), 2)
        cv2.line(frame, (bx1, by2), (bx1, by2 - c_len), (0, 255, 255), 2)
        cv2.line(frame, (bx2, by2), (bx2 - c_len, by2), (0, 255, 255), 2)
        cv2.line(frame, (bx2, by2), (bx2, by2 - c_len), (0, 255, 255), 2)

        cv2.rectangle(frame, (bx1, by1 - 18), (bx1 + 175, by1), (13, 17, 32), -1)
        label_text = f"ANPR: {plate} | {speed}km/h"
        cv2.putText(frame, label_text, (bx1 + 4, by1 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.38, (6, 182, 212), 1, cv2.LINE_AA)

    curr_time = time.strftime("%Y-%m-%d %H:%M:%S")
    lat, lng = profile.get("coords", (28.6139, 77.2090))
    cv2.putText(frame, f"{curr_time} IST | LAT: {lat:.4f} LNG: {lng:.4f}", (10, h - 9),
                cv2.FONT_HERSHEY_SIMPLEX, 0.38, (148, 163, 184), 1, cv2.LINE_AA)

    resolution = profile.get("resolution", "1080P/60FPS")
    cv2.putText(frame, f"{resolution} | BACKEND STREAM", (w - 210, h - 9),
                cv2.FONT_HERSHEY_SIMPLEX, 0.38, (34, 197, 94), 1, cv2.LINE_AA)

    return frame


def get_camera_frame(camera_id: str, frame_index: int, target_w: int = 640, target_h: int = 360) -> np.ndarray:
    """Loads and formats a single frame for the specified camera."""
    camera_id = camera_id.upper()
    profile = CAMERA_STREAM_PROFILES.get(camera_id, {
        "name": f"Surveillance Node {camera_id}",
        "direction": "North-Axial",
        "plate": "DL01AB1044",
        "speed": 35,
        "offset": 0,
        "status": "online",
        "resolution": "1080P/60FPS",
        "coords": (28.6139, 77.2090),
        "bbox": [(180, 140, 320, 250)],
    })

    if profile.get("status") == "offline":
        return render_offline_frame(camera_id, target_w, target_h)

    if TOTAL_FRAMES > 0:
        offset = profile.get("offset", 0)
        actual_idx = (frame_index + offset) % TOTAL_FRAMES
        frame_path = FRAME_FILES[actual_idx]

        frame = cv2.imread(str(frame_path))
        if frame is not None:
            if frame.shape[1] != target_w or frame.shape[0] != target_h:
                frame = cv2.resize(frame, (target_w, target_h), interpolation=cv2.INTER_LINEAR)
            return render_hud_overlay(frame, profile, camera_id, frame_index)

    synthetic = np.zeros((target_h, target_w, 3), dtype=np.uint8)
    cv2.rectangle(synthetic, (0, target_h // 2), (target_w, target_h), (35, 40, 48), -1)
    
    car_x = (frame_index * 8 + profile.get("offset", 0)) % (target_w + 100) - 50
    for i in range(0, target_w, 80):
        cv2.line(synthetic, (i, target_h // 2 + 60), (i + 40, target_h // 2 + 60), (200, 200, 200), 2)
    
    cv2.rectangle(synthetic, (car_x, target_h // 2 + 40), (car_x + 90, target_h // 2 + 80), (0, 0, 220), -1)
    cv2.rectangle(synthetic, (car_x + 15, target_h // 2 + 20), (car_x + 70, target_h // 2 + 40), (0, 0, 220), -1)
    
    return render_hud_overlay(synthetic, profile, camera_id, frame_index)


def generate_frames(camera_id: str, fps: int = 15) -> Generator[bytes, None, None]:
    """Generates continuous multipart/x-mixed-replace JPEG frames for MJPEG streaming."""
    frame_time = 1.0 / max(1, fps)
    frame_index = 0

    while True:
        start_time = time.time()

        frame = get_camera_frame(camera_id, frame_index)
        frame_index += 1

        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
        if not ret:
            continue

        frame_bytes = buffer.tobytes()

        yield (
            b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n'
            b'Content-Length: ' + str(len(frame_bytes)).encode() + b'\r\n\r\n' +
            frame_bytes + b'\r\n'
        )

        elapsed = time.time() - start_time
        if elapsed < frame_time:
            time.sleep(frame_time - elapsed)



@router.get("/stream/{camera_id}")
async def stream_camera(camera_id: str):
    """
    Returns a live MJPEG stream for the given camera.
    Directly viewable in React using:
      <img src="http://localhost:8000/api/stream/CAM-01" alt="Live Feed" />
    """
    return StreamingResponse(
        generate_frames(camera_id, fps=15),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            "Connection": "keep-alive",
        }
    )


@router.get("/frame/{camera_id}")
async def get_single_snapshot(camera_id: str):
    """
    Returns a single JPEG snapshot of the camera at the current instant.
    Useful for modal inspection, maps, and thumbnail previews.
    """
    frame = get_camera_frame(camera_id, int(time.time() * 10))
    ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
    if not ret:
        return Response(status_code=500, content=b"Encoding failed")

    return Response(
        content=buffer.tobytes(),
        media_type="image/jpeg",
        headers={
            "Cache-Control": "no-cache, max-age=0",
        }
    )


@router.get("/stream/status")
def stream_status():
    """Returns the operational status of all camera streams and dataset telemetry."""
    return {
        "engine": "OpenCV Multi-Node MJPEG Streamer",
        "dataset_frames_loaded": TOTAL_FRAMES,
        "dataset_path": str(FRAMES_DIR),
        "target_fps": 15,
        "active_nodes": len(CAMERA_STREAM_PROFILES),
        "cameras": [
            {
                "id": cid,
                "name": p["name"],
                "status": p["status"],
                "stream_url": f"/api/stream/{cid}",
                "snapshot_url": f"/api/frame/{cid}",
            }
            for cid, p in CAMERA_STREAM_PROFILES.items()
        ]
    }
