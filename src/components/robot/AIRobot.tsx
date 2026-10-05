import React, { useState, useEffect, useRef } from 'react';
import { useUniverse } from '../../context/UniverseContext';

export type RobotVariant = 'nova' | 'rover' | 'pixel';
export type RobotState = 'idle' | 'scanning' | 'processing' | 'success' | 'alert' | 'floating';

interface AIRobotProps {
  variant?: RobotVariant;
  state?: RobotState;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  message?: string;
  showHologram?: boolean;
  hologramText?: string;
  interactive?: boolean;
  targetRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  onClick?: () => void;
}

export const AIRobot: React.FC<AIRobotProps> = ({
  variant = 'nova',
  state = 'idle',
  size = 'md',
  message,
  showHologram = false,
  hologramText,
  interactive = true,
  targetRef,
  className = '',
  onClick
}) => {
  const { reducedMotion } = useUniverse();
  const robotRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Dimension scaling
  const sizeMap = {
    xs: { width: 44, height: 50 },
    sm: { width: 64, height: 72 },
    md: { width: 92, height: 104 },
    lg: { width: 128, height: 144 }
  };
  const { width, height } = sizeMap[size];

  // Mouse tracking to gently guide the robot's expressive eyes
  useEffect(() => {
    if (!interactive || reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!robotRef.current) return;
      const rect = robotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const dist = Math.hypot(deltaX, deltaY);

      if (dist < 800) {
        // Subtle eye deflection (max 4.5px)
        const angle = Math.atan2(deltaY, deltaX);
        const maxDeflection = Math.min(dist / 60, 4.5);
        setEyeOffset({
          x: Math.cos(angle) * maxDeflection,
          y: Math.sin(angle) * maxDeflection * 0.75
        });
        // Subtle head tilt
        setHeadTilt(Math.max(-8, Math.min(8, (deltaX / 500) * 10)));
      } else {
        setEyeOffset({ x: 0, y: 0 });
        setHeadTilt(0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive, reducedMotion]);

  // Color scheme based on status
  const getGlowColor = () => {
    switch (state) {
      case 'processing':
        return '#8b5cf6'; // Violet
      case 'success':
        return '#10b981'; // Emerald
      case 'alert':
        return '#f43f5e'; // Rose
      case 'scanning':
        return '#38bdf8'; // Sky blue
      default:
        return '#00f0ff'; // Cyan
    }
  };

  const glowColor = getGlowColor();

  return (
    <div
      ref={robotRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex flex-col items-center select-none group ${className}`}
      style={{
        transform: reducedMotion ? 'none' : `rotate(${headTilt}deg)`,
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      role="img"
      aria-label={`AI companion robot ${variant} in ${state} mode`}
    >
      {/* Speech / Telemetry Bubble */}
      {message && (
        <div 
          className="absolute -top-12 z-20 px-3 py-1.5 rounded-xl bg-space-900/90 border border-cyan-400/40 shadow-holo backdrop-blur-md text-[11px] font-mono text-cyan-200 tracking-wide whitespace-nowrap pointer-events-none animate-fadeIn"
          style={{
            boxShadow: `0 0 15px -3px ${glowColor}40`
          }}
        >
          <div className="flex items-center gap-1.5">
            <span 
              className="w-1.5 h-1.5 rounded-full animate-ping" 
              style={{ backgroundColor: glowColor }} 
            />
            <span>{message}</span>
          </div>
          <div 
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-space-900 border-r border-b border-cyan-400/40 rotate-45" 
          />
        </div>
      )}

      {/* Main Floating Robot Canvas Container */}
      <div 
        className={`relative ${reducedMotion ? '' : 'animate-float-slow'}`}
        style={{ width, height }}
      >
        {/* Anti-Gravity Propulsion Glow Ring Beneath */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-2.5 rounded-full blur-[3px] animate-robot-propulsion"
          style={{
            background: `radial-gradient(ellipse at center, ${glowColor} 0%, rgba(0,0,0,0) 70%)`
          }}
        />

        {/* Ambient Halo behind robot head */}
        <div
          className="absolute inset-2 rounded-full blur-md opacity-30 pointer-events-none transition-opacity duration-300 group-hover:opacity-60"
          style={{ backgroundColor: glowColor }}
        />

        {/* SVG Robot Artwork */}
        {variant === 'nova' && (
          <svg
            viewBox="0 0 100 110"
            className="w-full h-full drop-shadow-md overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Top Antenna */}
            <path
              d="M50 22V8"
              stroke="#64748b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Antenna Orb Sensor */}
            <circle
              cx="50"
              cy="7"
              r="4.5"
              fill={glowColor}
              className="animate-pulse"
              style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
            />

            {/* Anti-Grav Orbital Rings */}
            <ellipse
              cx="50"
              cy="96"
              rx="26"
              ry="5"
              stroke={glowColor}
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.8"
            />

            {/* Main Outer Chassis / Ceramic Aerodynamic Shell */}
            <path
              d="M24 45C24 28 35 22 50 22C65 22 76 28 76 45C76 68 68 84 50 84C32 84 24 68 24 45Z"
              fill="url(#novaBodyGrad)"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />

            {/* Subtle Micro Circuit Accent on Shell */}
            <path
              d="M32 36L40 40M68 36L60 40"
              stroke="rgba(0, 240, 255, 0.4)"
              strokeWidth="1"
              strokeLinecap="round"
            />

            {/* Dark Curved Glass Visor (Digital Face Screen) */}
            <rect
              x="30"
              y="38"
              width="40"
              height="26"
              rx="12"
              fill="#050a18"
              stroke="rgba(0, 240, 255, 0.3)"
              strokeWidth="1.2"
            />

            {/* Visor Glare / Glass Reflection */}
            <path
              d="M35 42C38 40 45 40 48 40"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1"
              strokeLinecap="round"
            />

            {/* Expressive LED Eyes with Tracking Deflection */}
            <g
              transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}
              className="transition-transform duration-75"
            >
              {state === 'processing' ? (
                // Thinking / Matrix mode
                <>
                  <rect x="37" y="49" width="8" height="4" rx="2" fill={glowColor} />
                  <rect x="55" y="49" width="8" height="4" rx="2" fill={glowColor} />
                </>
              ) : state === 'success' || isHovered ? (
                // Happy curved eyes
                <>
                  <path
                    d="M37 51C37 47 43 47 43 51"
                    stroke={glowColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M57 51C57 47 63 47 63 51"
                    stroke={glowColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </>
              ) : (
                // Friendly rounded digital eyes with natural blink
                <>
                  <ellipse
                    cx="41"
                    cy="50"
                    rx="3.5"
                    ry="4.5"
                    fill={glowColor}
                    className="animate-robot-blink"
                    style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }}
                  />
                  <ellipse
                    cx="59"
                    cy="50"
                    rx="3.5"
                    ry="4.5"
                    fill={glowColor}
                    className="animate-robot-blink"
                    style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }}
                  />
                  {/* Eye highlight glints */}
                  <circle cx="42" cy="48" r="1.2" fill="#ffffff" />
                  <circle cx="60" cy="48" r="1.2" fill="#ffffff" />
                </>
              )}
            </g>

            {/* Floating Thruster Nodes */}
            <circle cx="21" cy="55" r="3.5" fill="#1e293b" stroke={glowColor} strokeWidth="1" />
            <circle cx="79" cy="55" r="3.5" fill="#1e293b" stroke={glowColor} strokeWidth="1" />

            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="novaBodyGrad" x1="50" y1="22" x2="50" y2="84" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1e293b" />
                <stop offset="0.5" stopColor="#0f172a" />
                <stop offset="1" stopColor="#09122a" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {variant === 'rover' && (
          <svg
            viewBox="0 0 100 110"
            className="w-full h-full drop-shadow-md overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Dual Sensor Rods */}
            <path d="M40 24L34 10M60 24L66 10" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
            <circle cx="33" cy="9" r="3.5" fill={glowColor} style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }} />
            <circle cx="67" cy="9" r="3.5" fill={glowColor} style={{ filter: `drop-shadow(0 0 5px ${glowColor})` }} />

            {/* Exploration Chassis */}
            <rect
              x="26"
              y="25"
              width="48"
              height="55"
              rx="18"
              fill="#0f172a"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />

            {/* Scanning Eye Visor */}
            <rect x="32" y="38" width="36" height="20" rx="8" fill="#030712" stroke={glowColor} strokeWidth="1" />
            
            {/* Scanning beam line inside visor */}
            <line
              x1="36"
              y1="48"
              x2="64"
              y2="48"
              stroke={glowColor}
              strokeWidth="2"
              className={state === 'scanning' ? 'animate-pulse' : ''}
              style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
            />
            <circle
              cx={50 + eyeOffset.x * 1.5}
              cy="48"
              r="3"
              fill="#ffffff"
            />

            {/* Telemetry Dots */}
            <circle cx="42" cy="68" r="1.5" fill="#38bdf8" />
            <circle cx="50" cy="68" r="1.5" fill="#38bdf8" />
            <circle cx="58" cy="68" r="1.5" fill="#38bdf8" />

            {/* Side Thrusters */}
            <rect x="18" y="44" width="7" height="18" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
            <rect x="75" y="44" width="7" height="18" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
          </svg>
        )}

        {variant === 'pixel' && (
          <svg
            viewBox="0 0 100 110"
            className="w-full h-full drop-shadow-md overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Micro Antenna */}
            <line x1="50" y1="28" x2="50" y2="16" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
            <rect x="47" y="12" width="6" height="6" rx="2" fill={glowColor} />

            {/* Geometric Block Chassis */}
            <rect
              x="28"
              y="28"
              width="44"
              height="44"
              rx="12"
              fill="#09122a"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />

            {/* Pixel Grid Visor */}
            <rect x="34" y="36" width="32" height="24" rx="6" fill="#030712" />

            {/* Pixel LED Eyes */}
            <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
              <rect x="38" y="44" width="6" height="6" rx="1.5" fill={glowColor} style={{ filter: `drop-shadow(0 0 3px ${glowColor})` }} />
              <rect x="56" y="44" width="6" height="6" rx="1.5" fill={glowColor} style={{ filter: `drop-shadow(0 0 3px ${glowColor})` }} />
            </g>

            {/* Tiny Core */}
            <circle cx="50" cy="85" r="4" fill={glowColor} opacity="0.8" />
          </svg>
        )}
      </div>

      {/* Hologram Data Stream Projection */}
      {showHologram && hologramText && (
        <div className="mt-2 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-[9px] font-mono text-cyan-300 shadow-glow-cyan animate-pulse">
          {hologramText}
        </div>
      )}
    </div>
  );
};
