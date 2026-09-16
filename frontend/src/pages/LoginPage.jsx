import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Cctv, ShieldCheck, AlertTriangle } from 'lucide-react';



const ROAD_COLOR       = '#0e1623';
const ASPHALT_COLOR    = '#141d2e';
const LANE_MARK_COLOR  = '#1e2d45';
const ROAD_WIDTH       = 38;


const H_ROADS = [0.18, 0.38, 0.57, 0.76];
const V_ROADS = [0.2, 0.42, 0.63, 0.82];


const CAR_COLORS = [
  { body: '#06b6d4', light: '#a5f3fc' }, 
  { body: '#3b82f6', light: '#bfdbfe' }, 
  { body: '#f59e0b', light: '#fde68a' }, 
  { body: '#22c55e', light: '#bbf7d0' }, 
  { body: '#e2e8f0', light: '#ffffff' }, 
  { body: '#f43f5e', light: '#fecdd3' }, 
  { body: '#a855f7', light: '#e9d5ff' }, 
];

function makeCars(W, H) {
  const cars = [];
  let id = 0;

  
  H_ROADS.forEach((pct, ri) => {
    const y = pct * H;
    const count = 3 + Math.floor(Math.random() * 3); 
    for (let i = 0; i < count; i++) {
      const dir = ri % 2 === 0 ? 1 : -1; 
      const color = CAR_COLORS[(id) % CAR_COLORS.length];
      cars.push({
        id: id++,
        axis: 'h',
        y,
        x: Math.random() * W,
        dir,
        speed: 1.2 + Math.random() * 1.8,
        w: 20, h: 10,
        color,
        lane: ri % 2 === 0 ? -6 : 6, 
      });
    }
    
    const count2 = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count2; i++) {
      const dir = ri % 2 === 0 ? -1 : 1;
      const color = CAR_COLORS[(id) % CAR_COLORS.length];
      cars.push({
        id: id++,
        axis: 'h',
        y,
        x: Math.random() * W,
        dir,
        speed: 1.0 + Math.random() * 1.6,
        w: 20, h: 10,
        color,
        lane: ri % 2 === 0 ? 6 : -6,
      });
    }
  });

  
  V_ROADS.forEach((pct, ri) => {
    const x = pct * W;
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const dir = ri % 2 === 0 ? 1 : -1;
      const color = CAR_COLORS[(id) % CAR_COLORS.length];
      cars.push({
        id: id++,
        axis: 'v',
        x,
        y: Math.random() * H,
        dir,
        speed: 1.0 + Math.random() * 1.8,
        w: 10, h: 20,
        color,
        lane: ri % 2 === 0 ? -6 : 6,
      });
    }
    
    const count2 = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count2; i++) {
      const dir = ri % 2 === 0 ? -1 : 1;
      const color = CAR_COLORS[(id) % CAR_COLORS.length];
      cars.push({
        id: id++,
        axis: 'v',
        x,
        y: Math.random() * H,
        dir,
        speed: 1.2 + Math.random() * 1.6,
        w: 10, h: 20,
        color,
        lane: ri % 2 === 0 ? 6 : -6,
      });
    }
  });

  return cars;
}

function TrafficCanvas() {
  const canvasRef = useRef(null);
  const carsRef   = useRef([]);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      carsRef.current = makeCars(canvas.width, canvas.height);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      
      ctx.fillStyle = '#06080f';
      ctx.fillRect(0, 0, W, H);

      
      ctx.fillStyle = 'rgba(30,45,69,0.35)';
      for (let gx = 0; gx < W; gx += 22) {
        for (let gy = 0; gy < H; gy += 22) {
          ctx.beginPath();
          ctx.arc(gx, gy, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      
      H_ROADS.forEach(pct => {
        const y = pct * H;
        
        ctx.fillStyle = ASPHALT_COLOR;
        ctx.fillRect(0, y - ROAD_WIDTH / 2, W, ROAD_WIDTH);
        
        ctx.strokeStyle = '#1e2d45';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, y - ROAD_WIDTH / 2); ctx.lineTo(W, y - ROAD_WIDTH / 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, y + ROAD_WIDTH / 2); ctx.lineTo(W, y + ROAD_WIDTH / 2); ctx.stroke();
        
        ctx.strokeStyle = '#1e3a5a';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([10, 10]);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        ctx.setLineDash([]);
      });

      
      V_ROADS.forEach(pct => {
        const x = pct * W;
        ctx.fillStyle = ASPHALT_COLOR;
        ctx.fillRect(x - ROAD_WIDTH / 2, 0, ROAD_WIDTH, H);
        ctx.strokeStyle = '#1e2d45';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x - ROAD_WIDTH / 2, 0); ctx.lineTo(x - ROAD_WIDTH / 2, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + ROAD_WIDTH / 2, 0); ctx.lineTo(x + ROAD_WIDTH / 2, H); ctx.stroke();
        ctx.strokeStyle = '#1e3a5a';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([10, 10]);
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        ctx.setLineDash([]);
      });

      
      H_ROADS.forEach(hy => {
        V_ROADS.forEach(vx => {
          ctx.fillStyle = '#111827';
          ctx.fillRect(
            vx * W - ROAD_WIDTH / 2,
            hy * H - ROAD_WIDTH / 2,
            ROAD_WIDTH, ROAD_WIDTH
          );
        });
      });

      
      carsRef.current.forEach(car => {
        if (car.axis === 'h') {
          car.x += car.dir * car.speed;
          if (car.x > W + 40)  car.x = -40;
          if (car.x < -40)     car.x = W + 40;

          const cy = car.y + car.lane;
          const cx = car.x;

          
          const frontX = car.dir > 0 ? cx + car.w / 2 : cx - car.w / 2;
          const grd = ctx.createRadialGradient(frontX, cy, 0, frontX, cy, 22);
          grd.addColorStop(0, car.color.light + '55');
          grd.addColorStop(1, 'transparent');
          ctx.fillStyle = grd;
          ctx.fillRect(frontX - 22, cy - 14, 44, 28);

          
          ctx.save();
          ctx.translate(cx, cy);
          if (car.dir < 0) ctx.scale(-1, 1);
          
          
          ctx.shadowColor = car.color.body;
          ctx.shadowBlur = 8;
          
          
          const r = 3;
          const bw = car.w, bh = car.h;
          ctx.beginPath();
          ctx.moveTo(-bw/2 + r, -bh/2);
          ctx.lineTo(bw/2 - r, -bh/2);
          ctx.quadraticCurveTo(bw/2, -bh/2, bw/2, -bh/2 + r);
          ctx.lineTo(bw/2, bh/2 - r);
          ctx.quadraticCurveTo(bw/2, bh/2, bw/2 - r, bh/2);
          ctx.lineTo(-bw/2 + r, bh/2);
          ctx.quadraticCurveTo(-bw/2, bh/2, -bw/2, bh/2 - r);
          ctx.lineTo(-bw/2, -bh/2 + r);
          ctx.quadraticCurveTo(-bw/2, -bh/2, -bw/2 + r, -bh/2);
          ctx.closePath();
          ctx.fillStyle = car.color.body;
          ctx.fill();

          
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fillRect(2, -bh/2 + 1.5, bw/2 - 3, bh - 3);

          
          ctx.shadowBlur = 0;
          ctx.fillStyle = car.color.light;
          ctx.fillRect(bw/2 - 2.5, -bh/2 + 1.5, 2, 2.5);
          ctx.fillRect(bw/2 - 2.5, bh/2 - 4, 2, 2.5);

          
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-bw/2 + 0.5, -bh/2 + 1.5, 1.5, 2.5);
          ctx.fillRect(-bw/2 + 0.5, bh/2 - 4, 1.5, 2.5);

          ctx.restore();
          ctx.shadowBlur = 0;

        } else {
          
          car.y += car.dir * car.speed;
          if (car.y > H + 40) car.y = -40;
          if (car.y < -40)    car.y = H + 40;

          const cx = car.x + car.lane;
          const cy = car.y;

          const frontY = car.dir > 0 ? cy + car.h / 2 : cy - car.h / 2;
          const grd = ctx.createRadialGradient(cx, frontY, 0, cx, frontY, 22);
          grd.addColorStop(0, car.color.light + '55');
          grd.addColorStop(1, 'transparent');
          ctx.fillStyle = grd;
          ctx.fillRect(cx - 14, frontY - 22, 28, 44);

          ctx.save();
          ctx.translate(cx, cy);
          if (car.dir < 0) ctx.scale(1, -1);

          ctx.shadowColor = car.color.body;
          ctx.shadowBlur = 8;

          const bw = car.w, bh = car.h;
          const r = 3;
          ctx.beginPath();
          ctx.moveTo(-bw/2 + r, -bh/2);
          ctx.lineTo(bw/2 - r, -bh/2);
          ctx.quadraticCurveTo(bw/2, -bh/2, bw/2, -bh/2 + r);
          ctx.lineTo(bw/2, bh/2 - r);
          ctx.quadraticCurveTo(bw/2, bh/2, bw/2 - r, bh/2);
          ctx.lineTo(-bw/2 + r, bh/2);
          ctx.quadraticCurveTo(-bw/2, bh/2, -bw/2, bh/2 - r);
          ctx.lineTo(-bw/2, -bh/2 + r);
          ctx.quadraticCurveTo(-bw/2, -bh/2, -bw/2 + r, -bh/2);
          ctx.closePath();
          ctx.fillStyle = car.color.body;
          ctx.fill();

          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fillRect(-bw/2 + 1.5, 2, bw - 3, bh/2 - 3);

          ctx.shadowBlur = 0;
          ctx.fillStyle = car.color.light;
          ctx.fillRect(-bw/2 + 1.5, bh/2 - 2.5, 2.5, 2);
          ctx.fillRect(bw/2 - 4, bh/2 - 2.5, 2.5, 2);

          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-bw/2 + 1.5, -bh/2 + 0.5, 2.5, 1.5);
          ctx.fillRect(bw/2 - 4, -bh/2 + 0.5, 2.5, 1.5);

          ctx.restore();
          ctx.shadowBlur = 0;
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ display: 'block' }}
    />
  );
}



export default function LoginPage() {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]   = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState(false);
  const [shake, setShake]             = useState(false);
  const [tick, setTick]               = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => {
      setTick(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError(false);
    setShake(false);

    const isValid =
      (email.trim() === 'admin@traffic.gov.in' && password === 'sih2026') ||
      (email.trim() === 'hello@drx.ai'          && password === 'sih2026') ||
      (email.trim() && (password === 'sih2026' || password === 'admin' || password.length >= 4));

    if (isValid) {
      setIsLoading(true);
      setTimeout(() => {
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/dashboard');
      }, 1200);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div
      className="w-screen h-screen overflow-hidden flex select-none"
      style={{ background: '#0a0d1a', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.45s ease-in-out; }

        @keyframes borderPulse {
          0%,100% { box-shadow: 0 0 0 rgba(6,182,212,0); }
          50%      { box-shadow: 0 0 20px rgba(6,182,212,0.12); }
        }
        .card-pulse { animation: borderPulse 3s ease-in-out infinite; }

        @keyframes drxGlow {
          0%,100% { text-shadow: 0 0 12px rgba(6,182,212,0.4); }
          50%      { text-shadow: 0 0 28px rgba(6,182,212,0.9), 0 0 60px rgba(6,182,212,0.3); }
        }
        .drx-glow { animation: drxGlow 2.5s ease-in-out infinite; }

        .input-field {
          width: 100%; height: 48px;
          padding: 0 44px;
          background: #070a14;
          border: 1px solid #1e2d45;
          border-radius: 8px;
          font-size: 13px; color: #f1f5f9;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field::placeholder { color: #2d3f5a; }
        .input-field:focus {
          border-color: #06b6d4;
          box-shadow: 0 0 0 2px rgba(6,182,212,0.12);
        }
        .input-field.err {
          border-color: #ef4444;
          box-shadow: 0 0 0 2px rgba(239,68,68,0.12);
        }
        .login-btn {
          width: 100%; height: 48px; border-radius: 8px;
          background: linear-gradient(135deg, #0e7490 0%, #0284c7 100%);
          border: 1px solid rgba(6,182,212,0.35);
          color: #fff; font-weight: 600; font-size: 14px;
          letter-spacing: 0.4px; cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(6,182,212,0.22);
          display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .login-btn:hover:not(:disabled) {
          box-shadow: 0 6px 30px rgba(6,182,212,0.45);
          transform: translateY(-1px);
        }
        .login-btn:disabled { opacity:.75; cursor:not-allowed; }
      `}</style>

      {}
      <div
        className="hidden lg:flex w-[58%] h-full flex-col relative overflow-hidden"
        style={{ borderRight: '1px solid #1e2d45' }}
      >
        {}
        <div className="absolute inset-0">
          <TrafficCanvas />
        </div>

        {}
        <div className="relative z-20 flex items-start p-8 pointer-events-none">
          <div>
            {}
            <div
              className="drx-glow text-[52px] font-black tracking-tight leading-none"
              style={{ color: '#06b6d4', fontFamily: "'Inter', sans-serif" }}
            >
              DRx
            </div>
            <div
              className="text-[11px] font-mono tracking-[0.3em] uppercase mt-1"
              style={{ color: '#1e4d7a' }}
            >
              Intelligent Traffic Systems
            </div>
          </div>
        </div>

        {}
        <div
          className="relative z-20 mt-auto px-8 py-5 flex items-end justify-between pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(6,8,15,0.92) 0%, transparent 100%)' }}
        >
          <div>
            <p className="text-xs font-bold" style={{ color: '#06b6d4' }}>City-Wide AI Engine</p>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: '#1e4d7a' }}>
              NCR Surveillance · 8 Active Nodes · SIH 2026
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}
              />
              <span className="text-[10px] font-mono" style={{ color: '#22c55e' }}>LIVE</span>
            </div>
            <p className="text-[10px] font-mono mt-0.5" style={{ color: '#475569' }}>{tick}</p>
          </div>
        </div>
      </div>

      {}
      <div
        className="flex-1 h-full flex flex-col items-center justify-center px-8 sm:px-14 relative"
        style={{ background: '#0a0d1a' }}
      >
        {}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, #1e2d45 1px, transparent 1px)',
            backgroundSize: '26px 26px',
            opacity: 0.2,
          }}
        />

        <div className={`relative z-10 w-full max-w-[370px] ${shake ? 'animate-shake' : ''}`}>

          {}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)' }}
              >
                <Cctv className="w-5 h-5" style={{ color: '#06b6d4' }} />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide leading-tight" style={{ color: '#06b6d4' }}>
                  Traffic Command
                </p>
                <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: '#475569' }}>
                  SIH 2026
                </p>
              </div>
            </div>
            <h1 className="text-[26px] font-bold leading-tight" style={{ color: '#f1f5f9' }}>
              Operator Sign In
            </h1>
            <p className="text-[13px] mt-1.5" style={{ color: '#475569' }}>
              Access the city-wide surveillance command center.
            </p>
          </div>

          {}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 mb-5"
            style={{ background: '#0d1120', border: '1px solid #1e2d45' }}
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: '#06b6d4' }} />
            <span className="text-[11px] font-mono" style={{ color: '#475569' }}>
              CLEARANCE REQUIRED ·{' '}
              <span style={{ color: '#06b6d4' }}>SYS-ADMIN / OPERATOR</span>
            </span>
          </div>

          {}
          <form
            onSubmit={handleLogin}
            className="rounded-xl p-6 space-y-4 card-pulse"
            style={{ background: '#0d1120', border: '1px solid #1e2d45' }}
          >
            {}
            <div>
              <label
                className="block text-[10px] font-mono mb-1.5 tracking-widest uppercase"
                style={{ color: '#475569' }}
              >
                Operator ID / Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                  <Mail className="w-4 h-4" style={{ color: error ? '#ef4444' : '#2d3f5a' }} />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(false); }}
                  placeholder="admin@traffic.gov.in"
                  className={`input-field${error ? ' err' : ''}`}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {}
            <div>
              <label
                className="block text-[10px] font-mono mb-1.5 tracking-widest uppercase"
                style={{ color: '#475569' }}
              >
                Access Code
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center">
                  <Lock className="w-4 h-4" style={{ color: error ? '#ef4444' : '#2d3f5a' }} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(false); }}
                  placeholder="••••••••"
                  className={`input-field${error ? ' err' : ''}`}
                  style={{ paddingRight: '44px' }}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors"
                  style={{ color: '#2d3f5a' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#2d3f5a')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {}
            {error && (
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#ef4444' }} />
                <span className="text-[11px] font-mono" style={{ color: '#ef4444' }}>
                  ACCESS DENIED · Invalid credentials
                </span>
              </div>
            )}

            {}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer" style={{ color: '#475569' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded cursor-pointer accent-cyan-500"
                />
                <span className="text-xs">Remember session</span>
              </label>
              <button
                type="button"
                className="text-xs font-medium transition-colors"
                style={{ color: '#06b6d4' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#22d3ee')}
                onMouseLeave={e => (e.currentTarget.style.color = '#06b6d4')}
              >
                Reset access
              </button>
            </div>

            {}
            <div className="pt-1">
              <button type="submit" disabled={isLoading} className="login-btn">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Authorize Access</span>
                )}
              </button>
            </div>
          </form>

          {}
          <p className="text-center text-[10px] font-mono mt-6" style={{ color: '#1e3a5f' }}>
            DRx · CITY-WIDE AI ENGINE · SECURE CHANNEL · v2.4.0
          </p>
        </div>
      </div>
    </div>
  );
}
