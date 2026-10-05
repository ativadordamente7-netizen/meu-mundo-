import React, { useEffect, useRef } from 'react';
import { ColorThemeType } from '../types';

interface CosmicAtmosphereProps {
  reducedMotion?: boolean;
  highContrast?: boolean;
  theme?: ColorThemeType;
}

export const CosmicAmbientAtmosphere: React.FC<CosmicAtmosphereProps> = ({
  reducedMotion = false,
  highContrast = false,
  theme = 'rainbow' as ColorThemeType,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (highContrast || reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isRunning = true;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animId);
      } else {
        isRunning = true;
        animId = requestAnimationFrame(render);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Particle color sets per theme
    const getParticlePalette = (t?: ColorThemeType) => {
      switch (t) {
        case 'sunset':
          return [
            { rgba: 'rgba(251, 191, 36, ', hex: '#fbbf24' }, // Amber
            { rgba: 'rgba(249, 115, 22, ', hex: '#f97316' }, // Orange
            { rgba: 'rgba(244, 63, 94, ', hex: '#f43f5e' }, // Rose/Coral
            { rgba: 'rgba(254, 240, 138, ', hex: '#fef08a' }, // Soft Sun
            { rgba: 'rgba(251, 146, 60, ', hex: '#fb923c' }, // Tangerine
            { rgba: 'rgba(255, 255, 255, ', hex: '#ffffff' }, // White
          ];
        case 'cosmic':
          return [
            { rgba: 'rgba(56, 189, 248, ', hex: '#38bdf8' }, // Cyan
            { rgba: 'rgba(129, 140, 248, ', hex: '#818cf8' }, // Indigo
            { rgba: 'rgba(192, 132, 252, ', hex: '#c084fc' }, // Lavender
            { rgba: 'rgba(168, 85, 247, ', hex: '#a855f7' }, // Purple
            { rgba: 'rgba(99, 102, 241, ', hex: '#6366f1' }, // Royal
            { rgba: 'rgba(255, 255, 255, ', hex: '#ffffff' }, // White
          ];
        case 'garden':
          return [
            { rgba: 'rgba(52, 211, 153, ', hex: '#34d399' }, // Mint
            { rgba: 'rgba(16, 185, 129, ', hex: '#10b981' }, // Emerald
            { rgba: 'rgba(45, 212, 191, ', hex: '#2dd4bf' }, // Turquoise
            { rgba: 'rgba(163, 230, 53, ', hex: '#a3e635' }, // Lime
            { rgba: 'rgba(56, 189, 248, ', hex: '#38bdf8' }, // Celestial
            { rgba: 'rgba(255, 255, 255, ', hex: '#ffffff' }, // White
          ];
        case 'rainbow':
        default:
          return [
            { rgba: 'rgba(251, 191, 36, ', hex: '#fbbf24' }, // Warm golden
            { rgba: 'rgba(56, 189, 248, ', hex: '#38bdf8' }, // Celestial cyan
            { rgba: 'rgba(244, 114, 182, ', hex: '#f472b6' }, // Cheerful pink
            { rgba: 'rgba(52, 211, 153, ', hex: '#34d399' }, // Mint/emerald
            { rgba: 'rgba(192, 132, 252, ', hex: '#c084fc' }, // Lavender
            { rgba: 'rgba(255, 255, 255, ', hex: '#ffffff' }, // White
          ];
      }
    };

    const palette = getParticlePalette(theme);

    // Cheerful, colorful stardust particles across the spectrum
    const particleCount = 48;
    const particles = Array.from({ length: particleCount }, (_, i) => {
      const isStar = i % 2 === 0;
      const col = palette[i % palette.length];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: isStar ? Math.random() * 1.5 + 0.5 : Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.45 + 0.25,
        baseAlpha: Math.random() * 0.4 + 0.2,
        twinkleSpeed: 0.01 + Math.random() * 0.02,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.09 - Math.random() * 0.15,
        isStar,
        color: col.rgba,
        shadowColor: col.hex,
      };
    });

    let time = 0;

    const render = () => {
      if (!isRunning) return;
      time += 0.018;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -12) {
          p.y = height + 12;
          p.x = Math.random() * width;
        }
        if (p.x < -12) p.x = width + 12;
        if (p.x > width + 12) p.x = -12;

        const currentAlpha =
          p.baseAlpha + Math.sin(time * p.twinkleSpeed * 50 + p.x * 0.05) * 0.22;
        const boundedAlpha = Math.max(0.1, Math.min(0.85, currentAlpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${boundedAlpha})`;

        if (p.radius > 1.2) {
          ctx.shadowBlur = 7;
          ctx.shadowColor = p.shadowColor;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reducedMotion, highContrast, theme]);

  if (highContrast) return null;

  // Theme-specific background gradients and nebulae classes
  const getAtmosphereConfig = (t?: ColorThemeType) => {
    switch (t) {
      case 'sunset':
        return {
          bgGrad: 'bg-gradient-to-b from-[#1c1228] via-[#241320] to-[#120a1c]',
          nebula1: 'bg-radial from-amber-400/25 via-orange-500/15 to-transparent',
          nebula2: 'bg-radial from-rose-400/22 via-red-500/12 to-transparent',
          nebula3: 'bg-radial from-amber-300/22 via-yellow-500/12 to-transparent',
          nebula4: 'bg-radial from-orange-400/20 via-rose-500/10 to-transparent',
          nebula5: 'bg-radial from-red-600/18 via-purple-700/10 to-transparent',
          nebula6: 'bg-radial from-yellow-300/20 via-amber-400/10 to-transparent',
          stream1: ['#f59e0b', '#fb923c', '#f43f5e', '#ea580c'],
          stream2: ['#f43f5e', '#fbbf24', '#f97316', '#fbbf24'],
        };
      case 'cosmic':
        return {
          bgGrad: 'bg-gradient-to-b from-[#091136] via-[#10133a] to-[#070b22]',
          nebula1: 'bg-radial from-indigo-400/25 via-violet-500/15 to-transparent',
          nebula2: 'bg-radial from-sky-400/25 via-cyan-500/15 to-transparent',
          nebula3: 'bg-radial from-purple-500/22 via-fuchsia-500/12 to-transparent',
          nebula4: 'bg-radial from-cyan-400/20 via-blue-500/12 to-transparent',
          nebula5: 'bg-radial from-violet-500/22 via-indigo-600/14 to-transparent',
          nebula6: 'bg-radial from-blue-300/18 via-sky-400/10 to-transparent',
          stream1: ['#38bdf8', '#818cf8', '#a855f7', '#6366f1'],
          stream2: ['#a855f7', '#38bdf8', '#c084fc', '#818cf8'],
        };
      case 'garden':
        return {
          bgGrad: 'bg-gradient-to-b from-[#071e24] via-[#0d2328] to-[#051419]',
          nebula1: 'bg-radial from-emerald-400/25 via-teal-500/15 to-transparent',
          nebula2: 'bg-radial from-teal-400/22 via-cyan-500/12 to-transparent',
          nebula3: 'bg-radial from-green-400/20 via-emerald-500/12 to-transparent',
          nebula4: 'bg-radial from-cyan-400/20 via-teal-600/12 to-transparent',
          nebula5: 'bg-radial from-teal-600/22 via-emerald-800/12 to-transparent',
          nebula6: 'bg-radial from-lime-300/18 via-emerald-400/10 to-transparent',
          stream1: ['#34d399', '#10b981', '#06b6d4', '#14b8a6'],
          stream2: ['#06b6d4', '#34d399', '#2dd4bf', '#10b981'],
        };
      case 'rainbow':
      default:
        return {
          bgGrad: 'bg-gradient-to-b from-[#0c1236] via-[#14123c] to-[#080d24]',
          nebula1: 'bg-radial from-amber-400/24 via-yellow-500/12 to-transparent',
          nebula2: 'bg-radial from-sky-400/24 via-cyan-500/14 to-transparent',
          nebula3: 'bg-radial from-pink-500/20 via-rose-500/12 to-transparent',
          nebula4: 'bg-radial from-emerald-400/20 via-teal-500/12 to-transparent',
          nebula5: 'bg-radial from-purple-500/22 via-indigo-600/14 to-transparent',
          nebula6: 'bg-radial from-amber-300/20 via-orange-400/10 to-transparent',
          stream1: ['#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'],
          stream2: ['#8b5cf6', '#38bdf8', '#34d399', '#f472b6', '#fbbf24'],
        };
    }
  };

  const atmosphere = getAtmosphereConfig(theme);

  return (
    <div
      id="cosmic-ambient-background"
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
    >
      {/* 1. Rich Luminous Deep Twilight Atmosphere */}
      <div className={`absolute inset-0 transition-colors duration-700 ${atmosphere.bgGrad}`} />

      {/* 2. Soft Reference Art Atmosphere Blend (Diffused) */}
      <div className="absolute inset-0 opacity-[0.08] mix-blend-screen pointer-events-none overflow-hidden">
        <img
          src="/assets/reference_boy.jpg"
          alt=""
          className="w-full h-full object-cover object-center filter blur-3xl scale-125"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* 3. Radiant Multi-Chromatic Aurora & Themed Nebulae */}
      {/* Top-Right Light Bloom */}
      <div className={`absolute -top-24 -right-16 w-[560px] h-[560px] rounded-full blur-3xl transition-all duration-700 ${atmosphere.nebula1}`} />

      {/* Top-Left Glow */}
      <div className={`absolute -top-20 -left-16 w-[560px] h-[560px] rounded-full blur-3xl transition-all duration-700 ${atmosphere.nebula2}`} />

      {/* Center-Right Compassion Glow */}
      <div className={`absolute top-1/3 -right-28 w-[580px] h-[580px] rounded-full blur-3xl transition-all duration-700 ${atmosphere.nebula3}`} />

      {/* Center-Left Renewal Aura */}
      <div className={`absolute top-1/2 -left-28 w-[560px] h-[560px] rounded-full blur-3xl transition-all duration-700 ${atmosphere.nebula4}`} />

      {/* Horizon Bloom (Bottom-Center) */}
      <div className={`absolute -bottom-28 left-1/4 w-[650px] h-[500px] rounded-full blur-3xl transition-all duration-700 ${atmosphere.nebula5}`} />

      {/* Cheerful Bottom-Right Glow */}
      <div className={`absolute -bottom-32 -right-20 w-[500px] h-[500px] rounded-full blur-3xl transition-all duration-700 ${atmosphere.nebula6}`} />

      {/* 4. Multi-color Light Streams (Delicate flowing spectrum ribbons) */}
      {!reducedMotion && (
        <svg
          className="absolute inset-0 w-full h-full opacity-45 animate-cosmicStream pointer-events-none"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="streamGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={atmosphere.stream1[0]} stopOpacity="0" />
              <stop offset="25%" stopColor={atmosphere.stream1[1] || atmosphere.stream1[0]} stopOpacity="0.25" />
              <stop offset="50%" stopColor={atmosphere.stream1[2] || atmosphere.stream1[0]} stopOpacity="0.22" />
              <stop offset="75%" stopColor={atmosphere.stream1[3] || atmosphere.stream1[0]} stopOpacity="0.25" />
              <stop offset="100%" stopColor={atmosphere.stream1[atmosphere.stream1.length - 1]} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="streamGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={atmosphere.stream2[0]} stopOpacity="0" />
              <stop offset="30%" stopColor={atmosphere.stream2[1] || atmosphere.stream2[0]} stopOpacity="0.25" />
              <stop offset="60%" stopColor={atmosphere.stream2[2] || atmosphere.stream2[0]} stopOpacity="0.22" />
              <stop offset="85%" stopColor={atmosphere.stream2[3] || atmosphere.stream2[0]} stopOpacity="0.25" />
              <stop offset="100%" stopColor={atmosphere.stream2[atmosphere.stream2.length - 1]} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Ribbon of cosmic light 1 */}
          <path
            d="M-100,200 C300,100 600,380 1100,220 C1300,160 1450,280 1600,320"
            stroke="url(#streamGrad1)"
            strokeWidth="3.5"
            strokeDasharray="10 14"
            className="filter blur-[1.5px]"
          />

          {/* Ribbon of cosmic light 2 */}
          <path
            d="M-80,680 C320,520 700,750 1150,560 C1350,480 1500,580 1650,620"
            stroke="url(#streamGrad2)"
            strokeWidth="3"
            strokeDasharray="14 18"
            className="filter blur-[2px]"
          />
        </svg>
      )}

      {/* 5. Canvas for Gently Floating Multi-colored Stars & Stardust Particles */}
      {!reducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-90"
        />
      )}

      {/* 6. Soft Visual Framing Vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#040612]/50" />
    </div>
  );
};
