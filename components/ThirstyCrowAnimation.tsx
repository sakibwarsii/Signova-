"use client";

import React, { useState, useEffect, useRef } from 'react';

interface ThirstyCrowAnimationProps {
  onSwitchToSlides?: () => void;
  isPaused?: boolean;
}

export default function ThirstyCrowAnimation({
  onSwitchToSlides,
  isPaused = false
}: ThirstyCrowAnimationProps) {
  // 8 progressive narrative scenes spanning ~90 seconds total
  const [sceneIndex, setSceneIndex] = useState(0);
  const [pebblesDropped, setPebblesDropped] = useState(0);
  const [isPlaying, setIsPlaying] = useState(!isPaused);
  const [crowWingFlap, setCrowWingFlap] = useState(false);
  const [waterRipple, setWaterRipple] = useState(false);

  const SCENES = [
    {
      id: 1,
      title: "Scorching Desert Flight",
      narrative: "A thirsty crow flies across the hot, dry land searching desperately for water.",
      image: "/demo_images/thirsty_crow/3d_crow_flying.jpg",
      crowState: "flying",
      crowPos: { x: 180, y: 70 },
      waterLevelPct: 15,
      pebblesInPot: 0,
      badge: "Act I: The Search"
    },
    {
      id: 2,
      title: "Discovering the Pitcher",
      narrative: "The crow spots a clay pitcher under a tree and swoops down with great hope!",
      image: "/demo_images/thirsty_crow/3d_crow_finds_pot.jpg",
      crowState: "landing",
      crowPos: { x: 500, y: 270 },
      waterLevelPct: 20,
      pebblesInPot: 0,
      badge: "Act II: Hope"
    },
    {
      id: 3,
      title: "Water Out of Reach!",
      narrative: "The water is too low at the bottom of the pot. The crow's beak cannot reach it!",
      image: "/demo_images/thirsty_crow/3d_crow_water_low.jpg",
      crowState: "peering",
      crowPos: { x: 385, y: 155 },
      waterLevelPct: 22,
      pebblesInPot: 0,
      badge: "Act III: The Dilemma"
    },
    {
      id: 4,
      title: "The Brilliant Idea",
      narrative: "The crow spots smooth pebbles on the path and devises a clever plan.",
      image: "/demo_images/thirsty_crow/3d_crow_finds_pot.jpg",
      crowState: "thinking",
      crowPos: { x: 540, y: 280 },
      waterLevelPct: 25,
      pebblesInPot: 0,
      badge: "Act IV: Eureka!"
    },
    {
      id: 5,
      title: "Picking Up Pebbles",
      narrative: "One by one, the crow firmly grips pebbles in its beak and flies to the pot.",
      image: "/demo_images/thirsty_crow/3d_crow_water_low.jpg",
      crowState: "carrying",
      crowPos: { x: 440, y: 175 },
      waterLevelPct: 45,
      pebblesInPot: 4,
      badge: "Act V: Diligence"
    },
    {
      id: 6,
      title: "Dropping Pebbles: Plop! Plop!",
      narrative: "As stones fill the base, the water level begins to rise steadily toward the brim!",
      image: "/demo_images/thirsty_crow/3d_crow_drinking.png",
      crowState: "dropping",
      crowPos: { x: 380, y: 145 },
      waterLevelPct: 75,
      pebblesInPot: 9,
      badge: "Act VI: Water Rising"
    },
    {
      id: 7,
      title: "Quenching His Thirst!",
      narrative: "The cool water reaches the rim! The crow drinks deeply and feels fully refreshed.",
      image: "/demo_images/thirsty_crow/3d_crow_drinking.png",
      crowState: "drinking",
      crowPos: { x: 375, y: 155 },
      waterLevelPct: 95,
      pebblesInPot: 14,
      badge: "Act VII: Victory"
    },
    {
      id: 8,
      title: "Joyful Flight & Moral",
      narrative: "Where there's a will, there's a way! Wisdom and patience solve every obstacle.",
      image: "/demo_images/thirsty_crow/3d_crow_flying.jpg",
      crowState: "soaring",
      crowPos: { x: 620, y: 80 },
      waterLevelPct: 95,
      pebblesInPot: 14,
      badge: "Moral of the Fable"
    }
  ];

  const [renderMode, setRenderMode] = useState<'3d' | 'stage'>('3d');

  const currentScene = SCENES[sceneIndex];

  // Auto-advance scenes every ~11 seconds (8 scenes * 11.2s ≈ 90 seconds total)
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setSceneIndex((prev) => (prev + 1) % SCENES.length);
    }, 11250);
    return () => clearInterval(timer);
  }, [isPlaying, SCENES.length]);

  // Wing flap animation tick
  useEffect(() => {
    const flapInterval = setInterval(() => {
      setCrowWingFlap(f => !f);
    }, 280);
    return () => clearInterval(flapInterval);
  }, []);

  // Water ripple animation when pebbles drop
  useEffect(() => {
    if (sceneIndex >= 4 && sceneIndex <= 6) {
      setWaterRipple(true);
      const t = setTimeout(() => setWaterRipple(false), 900);
      return () => clearTimeout(t);
    }
  }, [sceneIndex]);

  // Calculate dynamic water height (scale 0-100%)
  const waterY = 280 - (currentScene.waterLevelPct * 1.1); // water surface Y
  const waterHeight = currentScene.waterLevelPct * 1.1;

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#05170f] via-[#092216] to-[#04120b] select-none text-white p-3 sm:p-5">
      {/* Ambient Sun & Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Blazing Summer Sun */}
        <div className="absolute top-4 right-8 w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-amber-400/90 blur-[1px] shadow-[0_0_60px_rgba(245,158,11,0.6)] animate-pulse" />
        <div className="absolute top-4 right-8 w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-yellow-200/40 blur-xl" />
        
        {/* Distant Arid Hills */}
        <svg className="absolute bottom-16 sm:bottom-20 inset-x-0 w-full h-32 opacity-40" preserveAspectRatio="none" viewBox="0 0 1000 200">
          <path d="M 0 160 Q 250 80 500 140 T 1000 110 L 1000 200 L 0 200 Z" fill="#78350f" />
          <path d="M 0 140 Q 300 60 650 120 T 1000 90 L 1000 200 L 0 200 Z" fill="#92400e" opacity="0.6" />
        </svg>

        {/* Dusty Ground Line */}
        <div className="absolute bottom-0 inset-x-0 h-16 sm:h-20 bg-gradient-to-t from-[#451a03] via-[#78350f] to-transparent" />
      </div>

      {/* Header Bar */}
      <div className="relative z-20 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/30 shadow-lg">
          <span className="text-base sm:text-lg">🐦</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-emerald-300">THE THIRSTY CROW</span>
              <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-400 font-semibold border border-emerald-600/40">
                {currentScene.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          {/* Toggle between 3D Cinematic Story and Interactive SVG Stage */}
          <button
            onClick={() => setRenderMode(m => m === '3d' ? 'stage' : '3d')}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600/80 to-amber-700/80 hover:from-amber-600 hover:to-amber-700 border border-amber-400/50 text-amber-100 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
            title="Switch between 3D Animated Film and Interactive Stage"
          >
            <span>{renderMode === '3d' ? '✨ 3D Pixar Mode' : '⚙️ Interactive Stage'}</span>
          </button>

          {onSwitchToSlides && (
            <button
              onClick={onSwitchToSlides}
              className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
              title="Switch to 23-slide textbook format"
            >
              <span>🖼️</span>
              <span className="hidden xs:inline">View 23 Slides</span>
            </button>
          )}

          <button
            onClick={() => setIsPlaying(p => !p)}
            className="flex items-center gap-1 bg-black/70 hover:bg-black/90 border border-white/20 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>{isPlaying ? '⏸️' : '▶️'}</span>
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>
      </div>

      {/* Main Animated Stage Area */}
      <div className="relative z-10 flex-1 my-2 flex items-center justify-center overflow-hidden rounded-2xl border border-emerald-500/30 bg-black/40 shadow-2xl">
        {renderMode === '3d' ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden group">
            {/* Cinematic 3D Render Image with smooth dissolve transition */}
            <img
              key={currentScene.image}
              src={currentScene.image}
              alt={currentScene.title}
              className="w-full h-full object-contain sm:object-cover transition-all duration-1000 ease-out scale-100 group-hover:scale-105"
            />

            {/* Subtle cinematic vignette */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/30" />

            {/* Water Level Gauge overlay on bottom right */}
            <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/40 shadow-lg">
              <span className="text-cyan-400 text-xs">💧</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Pitcher Water</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700"
                      style={{ width: `${currentScene.waterLevelPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-cyan-300">{currentScene.waterLevelPct}%</span>
                </div>
              </div>
            </div>

            {/* Quick Scene Navigation arrows */}
            <button
              onClick={() => setSceneIndex(prev => (prev - 1 + SCENES.length) % SCENES.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center text-sm shadow-md transition-all active:scale-90 opacity-0 group-hover:opacity-100 cursor-pointer"
              title="Previous Scene"
            >
              ◀
            </button>
            <button
              onClick={() => setSceneIndex(prev => (prev + 1) % SCENES.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center text-sm shadow-md transition-all active:scale-90 opacity-0 group-hover:opacity-100 cursor-pointer"
              title="Next Scene"
            >
              ▶
            </button>
          </div>
        ) : (
          <svg className="w-full h-full max-h-[380px]" viewBox="0 0 800 380">
          <defs>
            <linearGradient id="clayPotGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="40%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Sun in SVG coordinate space */}
          <circle cx="710" cy="55" r="36" fill="#f59e0b" opacity="0.95" />
          <circle cx="710" cy="55" r="48" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="6,4" />

          {/* Tree on Left providing shade */}
          <g transform="translate(40, 120)">
            <path d="M 40 180 Q 45 100 20 60 Q 60 10 90 60 Q 70 120 70 180 Z" fill="#78350f" />
            <circle cx="35" cy="45" r="50" fill="#047857" opacity="0.9" />
            <circle cx="85" cy="30" r="55" fill="#059669" opacity="0.85" />
            <circle cx="60" cy="65" r="45" fill="#10b981" opacity="0.75" />
          </g>

          {/* Ground Path with scattered pebbles */}
          <path d="M 0 320 Q 400 310 800 320 L 800 380 L 0 380 Z" fill="#573315" />
          <g fill="#78716c" stroke="#44403c">
            <circle cx="530" cy="330" r="7" />
            <circle cx="550" cy="335" r="9" />
            <circle cx="575" cy="328" r="8" />
            <circle cx="600" cy="332" r="10" />
            <circle cx="625" cy="334" r="7" />
            <circle cx="650" cy="329" r="8" />
            <circle cx="680" cy="333" r="9" />
          </g>

          {/* Clay Water Pot (Pitcher / Surahi) */}
          <g transform="translate(300, 160)">
            {/* Earthen Pot Body */}
            <ellipse cx="60" cy="110" rx="65" ry="50" fill="url(#clayPotGrad)" stroke="#451a03" strokeWidth="3" />
            
            {/* Pot Neck & Rim */}
            <path d="M 42 35 L 42 65 Q 35 75 10 90 L 110 90 Q 85 75 78 65 L 78 35 Z" fill="url(#clayPotGrad)" stroke="#451a03" strokeWidth="2.5" />
            <ellipse cx="60" cy="35" rx="22" ry="7" fill="#78350f" stroke="#451a03" strokeWidth="2.5" />

            {/* Cutaway Window to see water and rising pebbles */}
            <g clipPath="url(#potClip)">
              <clipPath id="potClip">
                <ellipse cx="60" cy="110" rx="55" ry="42" />
                <rect x="44" y="38" width="32" height="60" />
              </clipPath>

              {/* Water Inside Pitcher */}
              <rect x="10" y={waterY - 140} width="100" height={160} fill="url(#waterGrad)" />
              {/* Water surface line */}
              <ellipse cx="60" cy={waterY - 140} rx="40" ry="7" fill="#7dd3fc" />
              
              {waterRipple && (
                <ellipse cx="60" cy={waterY - 140} rx="30" ry="5" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" className="animate-ping" />
              )}

              {/* Pebbles inside pot */}
              {Array.from({ length: currentScene.pebblesInPot }).map((_, pIdx) => {
                const px = 35 + ((pIdx * 19) % 50);
                const py = 135 - Math.floor(pIdx / 3) * 11;
                return (
                  <circle key={pIdx} cx={px} cy={py} r="6.5" fill="#475569" stroke="#1e293b" strokeWidth="1" />
                );
              })}
            </g>

            {/* Water Level Percentage Tag */}
            <g transform="translate(135, 80)">
              <rect x="0" y="0" width="80" height="28" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" opacity="0.9" />
              <text x="40" y="18" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Water: {currentScene.waterLevelPct}%
              </text>
            </g>
          </g>

          {/* The Animated Crow */}
          <g 
            transform={`translate(${currentScene.crowPos.x}, ${currentScene.crowPos.y})`}
            className="transition-all duration-1000 ease-in-out"
          >
            {/* Thought bubble in thinking scene */}
            {currentScene.crowState === 'thinking' && (
              <g transform="translate(10, -50)" className="animate-bounce">
                <circle cx="0" cy="10" r="4" fill="#ffffff" />
                <circle cx="8" cy="0" r="6" fill="#ffffff" />
                <ellipse cx="28" cy="-15" rx="24" ry="16" fill="#ffffff" stroke="#38bdf8" strokeWidth="2" />
                <text x="28" y="-10" fontSize="16" textAnchor="middle">💡</text>
              </g>
            )}

            {/* Drops / Hearts in drinking scene */}
            {currentScene.crowState === 'drinking' && (
              <g transform="translate(-10, -20)" className="animate-pulse">
                <text x="0" y="0" fontSize="18">✨</text>
                <text x="-25" y="-10" fontSize="14">💧</text>
              </g>
            )}

            {/* Crow Body */}
            <ellipse cx="0" cy="0" rx="26" ry="17" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />

            {/* Crow Wing (Flapping) */}
            <path
              d={
                crowWingFlap || currentScene.crowState === 'flying' || currentScene.crowState === 'soaring'
                  ? "M -10 -5 Q 15 -35 25 -10 Q 5 15 -10 -5 Z"
                  : "M -10 -2 Q 10 -15 22 5 Q 5 15 -10 -2 Z"
              }
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* Crow Head */}
            <circle cx="-22" cy="-10" r="13" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="-25" cy="-12" r="3.5" fill="#ffffff" />
            <circle cx="-26" cy="-12" r="1.8" fill="#0f172a" />

            {/* Beak */}
            <polygon 
              points="-32,-10 -48,-6 -32,-3" 
              fill="#f59e0b" 
              stroke="#d97706" 
              strokeWidth="1.5" 
            />

            {/* Pebble in beak when carrying or dropping */}
            {(currentScene.crowState === 'carrying' || currentScene.crowState === 'dropping') && (
              <circle cx="-52" cy="-4" r="6" fill="#64748b" stroke="#334155" strokeWidth="1.5" className="animate-bounce" />
            )}

            {/* Crow Tail */}
            <polygon points="20,-5 42,-8 40,5 20,4" fill="#0f172a" />

            {/* Crow Legs */}
            {currentScene.crowState !== 'flying' && currentScene.crowState !== 'soaring' && (
              <g stroke="#f59e0b" strokeWidth="2.5">
                <line x1="-5" y1="16" x2="-8" y2="35" />
                <line x1="8" y1="16" x2="8" y2="35" />
                <line x1="-15" y1="35" x2="-4" y2="35" />
                <line x1="2" y1="35" x2="14" y2="35" />
              </g>
            )}
          </g>
        </svg>
        )}
      </div>

      {/* Bottom Subtitle & Timeline Tray */}
      <div className="relative z-20 bg-black/80 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-3 shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-amber-300">
              {currentScene.title}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              Scene {sceneIndex + 1} of {SCENES.length}
            </span>
          </div>

          {/* Mini scene selector dots */}
          <div className="flex items-center gap-1.5">
            {SCENES.map((_, sIdx) => (
              <button
                key={sIdx}
                onClick={() => setSceneIndex(sIdx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  sIdx === sceneIndex 
                    ? 'bg-emerald-400 ring-2 ring-emerald-400/50 scale-125' 
                    : sIdx < sceneIndex 
                      ? 'bg-emerald-700' 
                      : 'bg-white/20 hover:bg-white/40'
                }`}
                title={`Jump to Scene ${sIdx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Narrative text */}
        <p className="text-xs sm:text-sm text-gray-200 font-medium">
          {currentScene.narrative}
        </p>
      </div>
    </div>
  );
}
