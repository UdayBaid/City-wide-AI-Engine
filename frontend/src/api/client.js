

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
};

const api = {
  
  BASE_URL,

  
  health: () =>
    fetch(`${BASE_URL}/health`).then(handleResponse),

  
  getStreamUrl: (cameraId) =>
    `${BASE_URL}/stream/${encodeURIComponent(cameraId)}`,

  
  getFrameUrl: (cameraId) =>
    `${BASE_URL}/frame/${encodeURIComponent(cameraId)}`,

  
  getStreamStatus: () =>
    fetch(`${BASE_URL}/stream/status`).then(handleResponse),

  
  getCameras: () =>
    fetch(`${BASE_URL}/cameras`).then(handleResponse),

  
  getAlerts: () =>
    fetch(`${BASE_URL}/alerts`).then(handleResponse),

  
  resolveAlert: (alertId) =>
    fetch(`${BASE_URL}/alerts/${encodeURIComponent(alertId)}/resolve`, {
      method: 'POST',
    }).then(handleResponse),

  
  getTraffic: () =>
    fetch(`${BASE_URL}/traffic`).then(handleResponse),

  
  getTrajectories: (plate = null) => {
    const url = plate
      ? `${BASE_URL}/trajectories?plate=${encodeURIComponent(plate)}`
      : `${BASE_URL}/trajectories`;
    return fetch(url).then(handleResponse);
  },

  
  getVehicles: (plate = null) => {
    const url = plate
      ? `${BASE_URL}/vehicles?plate=${encodeURIComponent(plate)}`
      : `${BASE_URL}/vehicles`;
    return fetch(url).then(handleResponse);
  },

  
  getReports: () =>
    fetch(`${BASE_URL}/reports`).then(handleResponse),

  
  chat: (message, history = []) =>
    fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    }).then(handleResponse),
};

export default api;
