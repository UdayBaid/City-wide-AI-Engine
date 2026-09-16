/**
 * Centralized API client for the City-wide AI Engine backend.
 * All calls go to http://localhost:8000/api
 *
 * Usage:
 *   import api from '../api/client';
 *   const { cameras } = await api.getCameras();
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
};

const api = {
  /** API Base URL */
  BASE_URL,

  /** Check backend health */
  health: () =>
    fetch(`${BASE_URL}/health`).then(handleResponse),

  /** Get live stream URL for MJPEG camera feed */
  getStreamUrl: (cameraId) =>
    `${BASE_URL}/stream/${encodeURIComponent(cameraId)}`,

  /** Get single snapshot JPEG frame URL */
  getFrameUrl: (cameraId) =>
    `${BASE_URL}/frame/${encodeURIComponent(cameraId)}`,

  /** Get stream engine status */
  getStreamStatus: () =>
    fetch(`${BASE_URL}/stream/status`).then(handleResponse),

  /** Get all camera nodes */
  getCameras: () =>
    fetch(`${BASE_URL}/cameras`).then(handleResponse),

  /** Get active alerts and historical incidents */
  getAlerts: () =>
    fetch(`${BASE_URL}/alerts`).then(handleResponse),

  /** Mark an alert as resolved on the backend */
  resolveAlert: (alertId) =>
    fetch(`${BASE_URL}/alerts/${encodeURIComponent(alertId)}/resolve`, {
      method: 'POST',
    }).then(handleResponse),

  /** Get 24-hour traffic flow, congestion, and velocity distribution */
  getTraffic: () =>
    fetch(`${BASE_URL}/traffic`).then(handleResponse),

  /** Get vehicle trajectory tracking telemetry */
  getTrajectories: (plate = null) => {
    const url = plate
      ? `${BASE_URL}/trajectories?plate=${encodeURIComponent(plate)}`
      : `${BASE_URL}/trajectories`;
    return fetch(url).then(handleResponse);
  },

  /** Get ANPR records and vehicle database. Optionally filter by plate. */
  getVehicles: (plate = null) => {
    const url = plate
      ? `${BASE_URL}/vehicles?plate=${encodeURIComponent(plate)}`
      : `${BASE_URL}/vehicles`;
    return fetch(url).then(handleResponse);
  },

  /** Get available reports list */
  getReports: () =>
    fetch(`${BASE_URL}/reports`).then(handleResponse),

  /**
   * Send a message to the RAG-powered AI assistant.
   * @param {string} message - The user's question
   * @param {Array} history - Previous turns [{role, parts}]
   * @returns {Promise<{answer: string, sources: Array, timestamp: string}>}
   */
  chat: (message, history = []) =>
    fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    }).then(handleResponse),
};

export default api;
