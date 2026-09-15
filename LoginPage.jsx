import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError(false);
    setShake(false);

    // Accept admin credentials or any demo entry
    const isValid =
      (email.trim() === 'admin@bel.gov.in' && password === 'sih2026') ||
      (email.trim() === 'hello@drx.ai' && password === 'sih2026') ||
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
      setTimeout(() => {
        setShake(false);
      }, 500);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-row select-none bg-[#05070c] font-sans">
      <style>{`
        /* Smooth subtle floating animation for the 3D orb background */
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-orb-float {
          animation: orbFloat 5s ease-in-out infinite;
        }

        /* 3D Car Breakout Animation: emerges smoothly from inside the orb towards the login form */
        @keyframes carEmergence {
          0% {
            transform: perspective(1000px) translate3d(0px, 0px, 0px) scale(0.94) rotateY(0deg) rotateX(0deg);
            filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.2)) brightness(0.9);
            opacity: 0.9;
          }
          25% {
            /* Headlight ignition & power up */
            transform: perspective(1000px) translate3d(6px, 2px, 15px) scale(0.98) rotateY(-1.5deg) rotateX(1deg);
            filter: drop-shadow(0 0 25px rgba(6, 182, 212, 0.7)) drop-shadow(0 0 40px rgba(59, 130, 246, 0.4)) brightness(1.25);
            opacity: 1;
          }
          65% {
            /* Breaking out past the sphere perimeter */
            transform: perspective(1000px) translate3d(36px, 12px, 50px) scale(1.14) rotateY(-3.5deg) rotateX(2deg);
            filter: drop-shadow(0 15px 35px rgba(6, 182, 212, 0.6)) drop-shadow(0 0 25px rgba(59, 130, 246, 0.5)) brightness(1.15);
          }
          100% {
            /* Resting emerged floating position */
            transform: perspective(1000px) translate3d(40px, 14px, 55px) scale(1.15) rotateY(-3deg) rotateX(1.5deg);
            filter: drop-shadow(0 18px 40px rgba(6, 182, 212, 0.55)) drop-shadow(0 0 28px rgba(59, 130, 246, 0.45)) brightness(1.1);
          }
        }

        /* Continuous gentle hover animation once emerged */
        @keyframes carHoverFloating {
          0%, 100% {
            transform: perspective(1000px) translate3d(40px, 14px, 55px) scale(1.15) rotateY(-3deg) rotateX(1.5deg);
            filter: drop-shadow(0 18px 40px rgba(6, 182, 212, 0.55)) drop-shadow(0 0 28px rgba(59, 130, 246, 0.45)) brightness(1.1);
          }
          50% {
            transform: perspective(1000px) translate3d(43px, 6px, 62px) scale(1.16) rotateY(-2deg) rotateX(0.5deg);
            filter: drop-shadow(0 24px 50px rgba(6, 182, 212, 0.7)) drop-shadow(0 0 36px rgba(59, 130, 246, 0.6)) brightness(1.18);
          }
        }

        .animate-car-emerge {
          animation: 
            carEmergence 2.2s cubic-bezier(0.2, 0.9, 0.3, 1) forwards,
            carHoverFloating 5s ease-in-out infinite 2.2s;
        }

        /* Glass Energy Burst Shockwave upon emergence */
        @keyframes energyShockwave {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          30% {
            opacity: 0.75;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        .animate-shockwave {
          animation: energyShockwave 1.8s cubic-bezier(0.1, 0.8, 0.3, 1) 0.5s forwards;
        }

        /* Card Shake on Error */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.45s ease-in-out;
        }

        /* Login Button Styling */
        .login-btn-blue {
          background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.45);
          transition: all 0.25s ease;
        }
        .login-btn-blue:hover {
          box-shadow: 0 6px 28px rgba(37, 99, 235, 0.7);
          transform: translateY(-1px);
        }
        .login-btn-blue:active {
          transform: translateY(0);
        }
      `}</style>

      {/* LEFT 52%: 3D SPHERE WITH CAR BREAKOUT ANIMATION */}
      <div className="w-[52%] h-full relative overflow-hidden bg-[#05070c] flex items-center justify-center">
        <div className="animate-orb-float relative w-full h-full flex items-center justify-center p-8">
          {/* Base Orb & DRx neon text */}
          <img
            src="/assets/drx_orb_empty.png?v=breakout"
            alt="DRx 3D Glass Sphere Background"
            className="max-h-[92%] w-auto object-contain pointer-events-none select-none drop-shadow-[0_0_50px_rgba(6,182,212,0.25)]"
          />

          {/* Cyan Energy Shockwave Ring at breakout moment */}
          <div className="absolute w-[280px] h-[280px] rounded-full border border-cyan-400/40 pointer-events-none animate-shockwave shadow-[0_0_40px_rgba(6,182,212,0.3)]" />

          {/* Emerging Supercar Layer (Layered 2.5D with Headlight Glow & 3D Perspective) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <img
              src="/assets/drx_car_cutout.png?v=breakout"
              alt="DRx Supercar Emerging from Sphere"
              className="max-h-[92%] w-auto object-contain animate-car-emerge"
            />
          </div>
        </div>
      </div>

      {/* RIGHT 48%: CLEAN, MINIMAL LIVE LOGIN FORM */}
      <div className="w-[48%] h-full bg-[#05070c] flex items-center justify-center px-10 lg:px-20 z-10">
        <div
          className={`w-full max-w-[390px] text-left transition-transform duration-200 ${
            shake ? 'animate-shake' : ''
          }`}
        >
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-[38px] font-bold text-white tracking-tight leading-tight">
              Welcome Back
            </h2>
            <p className="text-[14px] text-[#6b7280] mt-2 font-normal">
              Please enter your details to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#4b5563] group-focus-within:text-[#3b82f6] transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(false);
                  }}
                  placeholder="Email"
                  className={`w-full h-[52px] pl-11 pr-4 bg-[#0c101a] rounded-[10px] text-[14px] text-white placeholder-[#374151] outline-none transition-all duration-200 ${
                    error
                      ? 'border border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]'
                      : 'border border-[#1f293d] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#4b5563] group-focus-within:text-[#3b82f6] transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Password"
                  className={`w-full h-[52px] pl-11 pr-11 bg-[#0c101a] rounded-[10px] text-[14px] text-white placeholder-[#374151] outline-none transition-all duration-200 ${
                    error
                      ? 'border border-[#ef4444] focus:ring-1 focus:ring-[#ef4444]'
                      : 'border border-[#1f293d] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/30'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#4b5563] hover:text-[#9ca3af] cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-xs text-[#ef4444] font-medium pt-0.5">
                Invalid credentials. Please try again.
              </p>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-[14px] pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-[#6b7280] hover:text-slate-300 transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0c101a] border-[#1f293d] text-[#2563eb] focus:ring-0 cursor-pointer accent-blue-600"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="text-[#2563eb] hover:text-blue-400 font-medium transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="login-btn-blue w-full h-[50px] rounded-[10px] text-white font-semibold text-[15px] tracking-wide flex items-center justify-center disabled:opacity-80 cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </div>
          </form>

          {/* Sign Up Footer */}
          <div className="mt-8 text-center text-[14px] text-[#6b7280]">
            <span>Don't have an account? </span>
            <button
              type="button"
              className="text-[#2563eb] hover:text-blue-400 font-medium transition-colors cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
