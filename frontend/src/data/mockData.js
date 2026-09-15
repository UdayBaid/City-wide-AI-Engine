// Mock data for Bharat Electronics Limited (BEL) AI Traffic Surveillance System - SIH 2026

export const CAMERA_NODES = [
  {
    id: "CAM-01",
    name: "Connaught Place Outer Circle",
    shortName: "Connaught Place",
    lat: 28.6315,
    lng: 77.2167,
    status: "online",
    fps: 30,
    resolution: "1080P/60FPS",
    todayReads: 19420,
    accuracy: "96.4%",
    lastSeen: "Just now",
    direction: "Radial-North",
    videoSrc: "/videos/camera1.mp4",
    lastPlate: "DL01AB1044",
    lastSpeed: 38,
    vehicleCount: 1420
  },
  {
    id: "CAM-02",
    name: "India Gate C-Hexagon",
    shortName: "India Gate",
    lat: 28.6129,
    lng: 77.2295,
    status: "online",
    fps: 30,
    resolution: "4K/30FPS",
    todayReads: 22180,
    accuracy: "97.1%",
    lastSeen: "Just now",
    direction: "South-Circle",
    videoSrc: "/videos/camera2.mp4",
    lastPlate: "HR26BC4419",
    lastSpeed: 42,
    vehicleCount: 1890
  },
  {
    id: "CAM-03",
    name: "ITO Junction Mathura Road",
    shortName: "ITO Junction",
    lat: 28.6262,
    lng: 77.2410,
    status: "online",
    fps: 30,
    resolution: "1080P/30FPS",
    todayReads: 31450,
    accuracy: "95.8%",
    lastSeen: "Just now",
    direction: "East-Corridor",
    videoSrc: "/videos/camera3.mp4",
    lastPlate: "DL03CC8899",
    lastSpeed: 29,
    vehicleCount: 2450
  },
  {
    id: "CAM-04",
    name: "Karol Bagh Pusa Road",
    shortName: "Karol Bagh",
    lat: 28.6514,
    lng: 77.1907,
    status: "online",
    fps: 30,
    resolution: "1080P/30FPS",
    todayReads: 16840,
    accuracy: "94.9%",
    lastSeen: "Just now",
    direction: "West-Axial",
    videoSrc: "/videos/camera4.mp4",
    lastPlate: "UP16AK5522",
    lastSpeed: 34,
    vehicleCount: 1180
  },
  {
    id: "CAM-05",
    name: "AIIMS Flyover Ring Road",
    shortName: "AIIMS Flyover",
    lat: 28.5672,
    lng: 77.2100,
    status: "online",
    fps: 30,
    resolution: "4K/30FPS",
    todayReads: 28910,
    accuracy: "98.2%",
    lastSeen: "Just now",
    direction: "South-Radial",
    videoSrc: "/videos/camera5.mp4",
    lastPlate: "DL08CX9901",
    lastSpeed: 52,
    vehicleCount: 2210
  },
  {
    id: "CAM-06",
    name: "Dhaula Kuan Interchange",
    shortName: "Dhaula Kuan",
    lat: 28.5921,
    lng: 77.1729,
    status: "online",
    fps: 30,
    resolution: "1080P/60FPS",
    todayReads: 24700,
    accuracy: "96.7%",
    lastSeen: "Just now",
    direction: "Airport-Expressway",
    videoSrc: "/videos/camera6.mp4",
    lastPlate: "PB10XX1234",
    lastSpeed: 50,
    vehicleCount: 1960
  },
  {
    id: "CAM-07",
    name: "Lajpat Nagar Ring Road",
    shortName: "Lajpat Nagar",
    lat: 28.5677,
    lng: 77.2436,
    status: "offline",
    fps: 0,
    resolution: "1080P/30FPS",
    todayReads: 4210,
    accuracy: "0.0%",
    lastSeen: "14 mins ago",
    direction: "South-East",
    videoSrc: "/videos/camera7.mp4",
    lastPlate: "N/A",
    lastSpeed: 0,
    vehicleCount: 0
  },
  {
    id: "CAM-08",
    name: "Kashmiri Gate ISBT Junction",
    shortName: "Kashmiri Gate",
    lat: 28.6677,
    lng: 77.2283,
    status: "online",
    fps: 30,
    resolution: "1080P/60FPS",
    todayReads: 27530,
    accuracy: "96.1%",
    lastSeen: "Just now",
    direction: "North-Terminal",
    videoSrc: "/videos/camera8.mp4",
    lastPlate: "CH01TB9002",
    lastSpeed: 92,
    vehicleCount: 2130
  }
];

export const INITIAL_ALERTS = [
  {
    id: "ALT-901",
    severity: "critical",
    type: "Blacklist Hit",
    title: "Blacklisted Vehicle — DL08CX9901 at AIIMS",
    description: "NCR Crime Database Hit: Vehicle reported stolen in FIR #88219 (South Delhi). Intercept team notified.",
    camera: "CAM-05 (AIIMS Flyover)",
    timestamp: "2 mins ago",
    status: "Active",
    plate: "DL08CX9901",
    speed: "52 km/h"
  },
  {
    id: "ALT-902",
    severity: "warning",
    type: "Speed Violation",
    title: "Severe Speeding — HR26DQ5521 85km/h",
    description: "Speed radar detected 85 km/h in 50 km/h urban corridor. Automated e-Challan triggered.",
    camera: "CAM-03 (ITO Junction)",
    timestamp: "6 mins ago",
    status: "Investigating",
    plate: "HR26DQ5521",
    speed: "85 km/h"
  },
  {
    id: "ALT-903",
    severity: "warning",
    type: "Overspeed",
    title: "Overspeed — CH01TB9002 at ISBT",
    description: "Vehicle traveling at 92 km/h approaching North Terminal intersection zone.",
    camera: "CAM-08 (Kashmiri Gate)",
    timestamp: "12 mins ago",
    status: "Active",
    plate: "CH01TB9002",
    speed: "92 km/h"
  },
  {
    id: "ALT-904",
    severity: "info",
    type: "System Heartbeat",
    title: "Camera Offline — CAM-07 Lajpat Nagar",
    description: "Telemetry heartbeat timeout. Field maintenance team ticket #TK-4402 generated.",
    camera: "CAM-07 (Lajpat Nagar)",
    timestamp: "14 mins ago",
    status: "Investigating",
    plate: "N/A",
    speed: "0 km/h"
  },
  {
    id: "ALT-905",
    severity: "info",
    type: "Congestion Alert",
    title: "High Density Congestion — ITO Junction",
    description: "Corridor queue exceeds 450m on Vikas Marg westbound approach. Density Index: 88%.",
    camera: "CAM-03 (ITO Junction)",
    timestamp: "21 mins ago",
    status: "Active",
    plate: "N/A",
    speed: "14 km/h"
  }
];

export const HISTORICAL_INCIDENTS = [
  { id: "INC-881", severity: "critical", type: "Blacklist Hit", description: "Stolen Scorpio flagged via OCR", camera: "CAM-05 AIIMS", timestamp: "Today 10:14", status: "Resolved" },
  { id: "INC-880", severity: "warning", type: "Wrong Way Driving", description: "Two-wheeler contraflow on Outer Ring", camera: "CAM-06 Dhaula Kuan", timestamp: "Today 09:42", status: "Resolved" },
  { id: "INC-879", severity: "warning", type: "Speed Violation", description: "Excess speed 98km/h on corridor", camera: "CAM-08 Kashmiri Gate", timestamp: "Today 09:15", status: "Resolved" },
  { id: "INC-878", severity: "info", type: "VIP Convoy Movement", description: "Priority corridor clear protocol activated", camera: "CAM-02 India Gate", timestamp: "Today 08:30", status: "Resolved" },
  { id: "INC-877", severity: "critical", type: "Hit and Run", description: "Commercial truck plate correlation ongoing", camera: "CAM-04 Karol Bagh", timestamp: "Today 07:11", status: "Investigating" },
  { id: "INC-876", severity: "warning", type: "Red Light Jump", description: "Multi-vehicle RLVD violation captured", camera: "CAM-01 Connaught Place", timestamp: "Today 06:45", status: "Resolved" },
  { id: "INC-875", severity: "info", type: "Node Reboot", description: "CAM-03 Optical engine scheduled maintenance", camera: "CAM-03 ITO Junction", timestamp: "Today 04:00", status: "Resolved" },
];

export const ANPR_RECORDS_MOCK = [
  { id: "REC-101", plate: "PB10XX1234", vehicleModel: "Hyundai Verna (White)", camera: "CAM-06", location: "Dhaula Kuan", timestamp: "14:10:22", speed: "50 km/h", status: "Clear", confidence: "98.4%" },
  { id: "REC-102", plate: "PB10XX1234", vehicleModel: "Hyundai Verna (White)", camera: "CAM-04", location: "Karol Bagh", timestamp: "14:22:45", speed: "36 km/h", status: "Clear", confidence: "97.8%" },
  { id: "REC-103", plate: "PB10XX1234", vehicleModel: "Hyundai Verna (White)", camera: "CAM-01", location: "Connaught Place", timestamp: "14:35:12", speed: "31 km/h", status: "Clear", confidence: "98.9%" },
  { id: "REC-104", plate: "PB10XX1234", vehicleModel: "Hyundai Verna (White)", camera: "CAM-02", location: "India Gate", timestamp: "14:48:04", speed: "42 km/h", status: "Clear", confidence: "99.1%" },
  { id: "REC-105", plate: "DL08CX9901", vehicleModel: "Mahindra Scorpio (Black)", camera: "CAM-05", location: "AIIMS Flyover", timestamp: "14:51:19", speed: "52 km/h", status: "Blacklist", confidence: "99.4%" },
  { id: "REC-106", plate: "HR26DQ5521", vehicleModel: "Honda City (Silver)", camera: "CAM-03", location: "ITO Junction", timestamp: "14:49:33", speed: "85 km/h", status: "Speeding", confidence: "96.2%" },
  { id: "REC-107", plate: "CH01TB9002", vehicleModel: "Toyota Fortuner (Grey)", camera: "CAM-08", location: "Kashmiri Gate", timestamp: "14:47:11", speed: "92 km/h", status: "Speeding", confidence: "95.5%" },
  { id: "REC-108", plate: "DL01AB1044", vehicleModel: "Maruti Swift (Red)", camera: "CAM-01", location: "Connaught Place", timestamp: "14:45:50", speed: "38 km/h", status: "Clear", confidence: "98.0%" },
  { id: "REC-109", plate: "HR26BC4419", vehicleModel: "Tata Nexon (Blue)", camera: "CAM-02", location: "India Gate", timestamp: "14:44:12", speed: "42 km/h", status: "Clear", confidence: "97.3%" },
  { id: "REC-110", plate: "UP16AK5522", vehicleModel: "Kia Seltos (Dark Grey)", camera: "CAM-04", location: "Karol Bagh", timestamp: "14:42:08", speed: "34 km/h", status: "Clear", confidence: "96.8%" },
  { id: "REC-111", plate: "DL03CC8899", vehicleModel: "BMW 3 Series (White)", camera: "CAM-03", location: "ITO Junction", timestamp: "14:40:27", speed: "29 km/h", status: "Clear", confidence: "98.7%" },
  { id: "REC-112", plate: "DL12CP0045", vehicleModel: "Hyundai Creta (White)", camera: "CAM-05", location: "AIIMS Flyover", timestamp: "14:38:15", speed: "48 km/h", status: "Clear", confidence: "97.6%" },
  { id: "REC-113", plate: "HR51AU7766", vehicleModel: "Maruti Baleno (Silver)", camera: "CAM-06", location: "Dhaula Kuan", timestamp: "14:36:44", speed: "56 km/h", status: "Clear", confidence: "98.1%" },
  { id: "REC-114", plate: "UP14BT3399", vehicleModel: "Toyota Innova (Silver)", camera: "CAM-08", location: "Kashmiri Gate", timestamp: "14:34:29", speed: "44 km/h", status: "Clear", confidence: "95.9%" },
  { id: "REC-115", plate: "DL04CA1212", vehicleModel: "Mercedes C-Class (Black)", camera: "CAM-01", location: "Connaught Place", timestamp: "14:32:01", speed: "30 km/h", status: "Clear", confidence: "99.0%" },
  { id: "REC-116", plate: "RJ14CW9021", vehicleModel: "Mahindra Thar (Red)", camera: "CAM-03", location: "ITO Junction", timestamp: "14:30:19", speed: "78 km/h", status: "Speeding", confidence: "96.4%" },
  { id: "REC-117", plate: "DL09SV4590", vehicleModel: "Tata Harrier (Green)", camera: "CAM-04", location: "Karol Bagh", timestamp: "14:28:44", speed: "35 km/h", status: "Clear", confidence: "97.5%" },
  { id: "REC-118", plate: "UK07TA6611", vehicleModel: "Commercial Bus (Yellow)", camera: "CAM-08", location: "Kashmiri Gate", timestamp: "14:26:30", speed: "39 km/h", status: "Clear", confidence: "94.8%" },
  { id: "REC-119", plate: "DL02CQ3499", vehicleModel: "Honda Amaze (White)", camera: "CAM-02", location: "India Gate", timestamp: "14:24:18", speed: "40 km/h", status: "Clear", confidence: "98.3%" },
  { id: "REC-120", plate: "DL07CD1122", vehicleModel: "Audi A4 (Black)", camera: "CAM-05", location: "AIIMS Flyover", timestamp: "14:21:05", speed: "55 km/h", status: "Clear", confidence: "98.8%" },
  { id: "REC-121", plate: "PB02BK8801", vehicleModel: "Mahindra Bolero (White)", camera: "CAM-06", location: "Dhaula Kuan", timestamp: "14:18:55", speed: "82 km/h", status: "Speeding", confidence: "97.2%" },
  { id: "REC-122", plate: "HR29AZ0019", vehicleModel: "Ford EcoSport (Grey)", camera: "CAM-01", location: "Connaught Place", timestamp: "14:15:33", speed: "33 km/h", status: "Clear", confidence: "96.9%" },
  { id: "REC-123", plate: "DL01ST9922", vehicleModel: "Auto Rickshaw (Green/Yellow)", camera: "CAM-03", location: "ITO Junction", timestamp: "14:12:10", speed: "25 km/h", status: "Clear", confidence: "95.1%" },
  { id: "REC-124", plate: "UP80BQ4455", vehicleModel: "Toyota Fortuner (Black)", camera: "CAM-05", location: "AIIMS Flyover", timestamp: "14:09:40", speed: "89 km/h", status: "Blacklist", confidence: "99.2%" },
  { id: "REC-125", plate: "DL10CK7811", vehicleModel: "Volkswagen Polo (Red)", camera: "CAM-04", location: "Karol Bagh", timestamp: "14:05:22", speed: "37 km/h", status: "Clear", confidence: "97.7%" }
];

export const TRAJECTORY_TARGET = {
  plate: "PB10XX1234",
  model: "Hyundai Verna (White)",
  owner: "Gurpreet S. (Ludhiana)",
  category: "Sedan / Light Motor Vehicle",
  totalDistance: "18.4 km",
  duration: "38 mins",
  avgSpeed: "39.2 km/h",
  status: "Active Surveillance",
  nodes: [
    { camera: "CAM-06", location: "Dhaula Kuan", time: "14:10", speed: "50 km/h", direction: "North-East", lat: 28.5921, lng: 77.1729, status: "Normal" },
    { camera: "CAM-04", location: "Karol Bagh", time: "14:22", speed: "36 km/h", direction: "East", lat: 28.6514, lng: 77.1907, status: "Congested Corridor" },
    { camera: "CAM-01", location: "Connaught Place", time: "14:35", speed: "31 km/h", direction: "South-East", lat: 28.6315, lng: 77.2167, status: "Radial Zone" },
    { camera: "CAM-02", location: "India Gate", time: "14:48", speed: "42 km/h", direction: "South", lat: 28.6129, lng: 77.2295, status: "Target Intercept Ready" }
  ]
};

export const TRAFFIC_FLOW_24H = [
  { time: "00:00", vehicles: 420, avgSpeed: 58 },
  { time: "02:00", vehicles: 230, avgSpeed: 64 },
  { time: "04:00", vehicles: 310, avgSpeed: 62 },
  { time: "06:00", vehicles: 890, avgSpeed: 52 },
  { time: "08:00", vehicles: 2450, avgSpeed: 31 },
  { time: "09:00", vehicles: 3420, avgSpeed: 24 },
  { time: "10:00", vehicles: 3890, avgSpeed: 21 },
  { time: "12:00", vehicles: 2950, avgSpeed: 33 },
  { time: "14:00", vehicles: 2780, avgSpeed: 36 },
  { time: "16:00", vehicles: 3350, avgSpeed: 28 },
  { time: "18:00", vehicles: 4120, avgSpeed: 19 },
  { time: "19:00", vehicles: 4380, avgSpeed: 17 },
  { time: "20:00", vehicles: 3620, avgSpeed: 26 },
  { time: "22:00", vehicles: 1980, avgSpeed: 44 },
  { time: "23:59", vehicles: 1120, avgSpeed: 51 }
];

export const CONGESTED_SEGMENTS = [
  { route: "ITO → Vikas Marg", congestion: 92, speed: "14 km/h" },
  { route: "AIIMS Flyover", congestion: 84, speed: "22 km/h" },
  { route: "Kashmiri Gate → ISBT", congestion: 79, speed: "19 km/h" },
  { route: "Connaught Place Outer", congestion: 71, speed: "27 km/h" },
  { route: "Barakhamba Road", congestion: 65, speed: "30 km/h" }
];

export const VELOCITY_DISTRIBUTION = [
  { bracket: "0-20 km/h", count: 3420, label: "Crawling / Gridlock" },
  { bracket: "20-40 km/h", count: 5890, label: "Urban Flow" },
  { bracket: "40-60 km/h", count: 4720, label: "Normal Velocity" },
  { bracket: "60-80 km/h", count: 1820, label: "High Speed" },
  { bracket: "80+ km/h", count: 480, label: "Speed Violations" }
];

export const TOP_OD_CORRIDORS = [
  { corridor: "Kashmiri Gate → AIIMS", volume: 18420 },
  { corridor: "Dhaula Kuan → Connaught Place", volume: 16950 },
  { corridor: "ITO → Karol Bagh", volume: 14810 },
  { corridor: "Lajpat Nagar → India Gate", volume: 13620 },
  { corridor: "Karol Bagh → Connaught Place", volume: 12450 },
  { corridor: "AIIMS → Dhaula Kuan", volume: 11890 },
  { corridor: "ISBT → Connaught Place", volume: 10450 },
  { corridor: "India Gate → AIIMS", volume: 9870 },
  { corridor: "Karol Bagh → Dhaula Kuan", volume: 8940 },
  { corridor: "ITO → Kashmiri Gate", volume: 8320 }
];

// 7 days x 24 hours congestion intensity matrix (0 = low, 1 = moderate, 2 = high, 3 = critical)
export const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const WEEKLY_CONGESTION_MATRIX = DAYS_OF_WEEK.map((day, dIdx) => {
  const hours = Array.from({ length: 24 }, (_, h) => {
    let level = "low"; // 0
    if ((h >= 8 && h <= 11) || (h >= 17 && h <= 21)) {
      if (dIdx < 5) {
        level = (h === 9 || h === 10 || h === 18 || h === 19) ? "critical" : "high";
      } else {
        level = (h >= 18 && h <= 21) ? "high" : "normal";
      }
    } else if ((h >= 12 && h <= 16) || (h >= 7 && h <= 8)) {
      level = "normal";
    }
    return { hour: h, level };
  });
  return { day, hours };
});

export const REPORTS_LIST = [
  {
    id: "REP-001",
    title: "Daily Urban Traffic & Congestion Digest",
    date: "2026-09-14 06:00",
    format: "PDF",
    size: "2.4 MB",
    category: "Operations"
  },
  {
    id: "REP-002",
    title: "ANPR Hotlist Surveillance & Blacklist Hits",
    date: "2026-09-14 05:30",
    format: "PDF",
    size: "1.1 MB",
    category: "Law Enforcement"
  },
  {
    id: "REP-003",
    title: "Peak Hour Corridor Velocity Analysis",
    date: "2026-09-13 23:59",
    format: "CSV",
    size: "4.8 MB",
    category: "Analytics"
  },
  {
    id: "REP-004",
    title: "Weekly Camera Reliability & Downtime Audit",
    date: "2026-09-13 18:00",
    format: "PDF",
    size: "3.2 MB",
    category: "Infrastructure"
  },
  {
    id: "REP-005",
    title: "Speed Enforcement Violation Notice Export",
    date: "2026-09-13 12:00",
    format: "ZIP",
    size: "5.6 MB",
    category: "Enforcement"
  }
];

export const INDIAN_VEHICLE_DATABASE = [
  { plate: "PB10XX1234", make: "Hyundai Verna", color: "White", type: "Sedan", registeredCity: "Ludhiana, PB", taxStatus: "Valid", flag: "Under Tracking" },
  { plate: "DL08CX9901", make: "Mahindra Scorpio", color: "Black", type: "SUV", registeredCity: "South Delhi, DL", taxStatus: "Defaulter", flag: "CRITICAL BLACKLIST" },
  { plate: "HR26DQ5521", make: "Honda City", color: "Silver", type: "Sedan", registeredCity: "Gurugram, HR", taxStatus: "Valid", flag: "Speed Violator" },
  { plate: "CH01TB9002", make: "Toyota Fortuner", color: "Grey", type: "SUV", registeredCity: "Chandigarh, CH", taxStatus: "Valid", flag: "Speed Violator" },
  { plate: "DL01AB1044", make: "Maruti Swift", color: "Red", type: "Hatchback", registeredCity: "Central Delhi, DL", taxStatus: "Valid", flag: "Clear" },
  { plate: "HR26BC4419", make: "Tata Nexon", color: "Blue", type: "Compact SUV", registeredCity: "Gurugram, HR", taxStatus: "Valid", flag: "Clear" },
  { plate: "UP16AK5522", make: "Kia Seltos", color: "Dark Grey", type: "SUV", registeredCity: "Noida, UP", taxStatus: "Valid", flag: "Clear" },
  { plate: "DL03CC8899", make: "BMW 3 Series", color: "White", type: "Luxury Sedan", registeredCity: "South Delhi, DL", taxStatus: "Valid", flag: "Clear" },
  { plate: "DL12CP0045", make: "Hyundai Creta", color: "White", type: "SUV", registeredCity: "West Delhi, DL", taxStatus: "Valid", flag: "Clear" },
  { plate: "HR51AU7766", make: "Maruti Baleno", color: "Silver", type: "Hatchback", registeredCity: "Faridabad, HR", taxStatus: "Valid", flag: "Clear" },
  { plate: "UP14BT3399", make: "Toyota Innova", color: "Silver", type: "MPV", registeredCity: "Ghaziabad, UP", taxStatus: "Valid", flag: "Clear" },
  { plate: "RJ14CW9021", make: "Mahindra Thar", color: "Red", type: "4x4 SUV", registeredCity: "Jaipur, RJ", taxStatus: "Valid", flag: "Clear" }
];
