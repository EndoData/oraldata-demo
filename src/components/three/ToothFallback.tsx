"use client";

type SpecialtyId = "endo" | "implanto" | "omni" | "pedo";

type Props = {
  /** Endo reveal progress (0=enamel, 1=dentin, 2=canal). Only used when specialty === "endo". */
  active?: number;
  specialty?: SpecialtyId;
};

export function ToothFallback({ active = 0, specialty = "endo" }: Props) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg viewBox="-100 -140 200 280" className="w-[70%] max-w-sm" aria-hidden>
        <defs>
          <linearGradient id="enamelGrad" x1="0" y1="-1" x2="0" y2="1">
            <stop offset="0%" stopColor="#f7f2e8" />
            <stop offset="100%" stopColor="#e4dcc8" />
          </linearGradient>
          <linearGradient id="dentinGrad" x1="0" y1="-1" x2="0" y2="1">
            <stop offset="0%" stopColor="#ecd9b0" />
            <stop offset="100%" stopColor="#c8b07c" />
          </linearGradient>
          <radialGradient id="pulpGrad">
            <stop offset="0%" stopColor="#58b4d0" />
            <stop offset="100%" stopColor="#1f5c77" />
          </radialGradient>
          <linearGradient id="canalGrad" x1="0" y1="-1" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2c744" />
            <stop offset="100%" stopColor="#c9a227" />
          </linearGradient>
          <linearGradient id="boneGrad" x1="0" y1="-1" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2ead8" />
            <stop offset="100%" stopColor="#d8c9a4" />
          </linearGradient>
          <linearGradient id="metalGrad" x1="0" y1="-1" x2="0" y2="1">
            <stop offset="0%" stopColor="#dde1e6" />
            <stop offset="100%" stopColor="#9aa2ab" />
          </linearGradient>
        </defs>

        {specialty === "endo" && <EndoFallback active={active} />}
        {specialty === "implanto" && <ImplantFallback />}
        {specialty === "omni" && <OmniFallback />}
        {specialty === "pedo" && <PedoFallback />}
      </svg>
    </div>
  );
}

function EndoFallback({ active }: { active: number }) {
  return (
    <>
      <path
        d="M 0,-110 C -60,-105 -72,-60 -72,-20 C -72,10 -60,30 -52,60 C -44,90 -32,120 -14,130 C -4,135 4,135 14,130 C 32,120 44,90 52,60 C 60,30 72,10 72,-20 C 72,-60 60,-105 0,-110 Z"
        fill="url(#enamelGrad)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
        opacity={active >= 1 ? 0 : 1}
        style={{ transition: "opacity 600ms ease" }}
      />
      <path
        d="M 0,-88 C -48,-84 -58,-48 -58,-16 C -58,8 -48,24 -42,48 C -36,72 -26,96 -11,104 C -3,108 3,108 11,104 C 26,96 36,72 42,48 C 48,24 58,8 58,-16 C 58,-48 48,-84 0,-88 Z"
        fill="url(#dentinGrad)"
        opacity={active >= 2 ? 0.3 : 1}
        style={{ transition: "opacity 600ms ease" }}
      />
      <path
        d="M 0,-55 C -28,-52 -34,-30 -34,-10 C -34,5 -28,15 -24,30 C -20,45 -15,60 -6,65 C -2,67 2,67 6,65 C 15,60 20,45 24,30 C 28,15 34,5 34,-10 C 34,-30 28,-52 0,-55 Z"
        fill="url(#pulpGrad)"
        opacity={active >= 1 ? 1 : 0.9}
        style={{ transition: "opacity 600ms ease" }}
      />
      <path
        d="M 0,-50 Q 2,-20 -1,10 T 1,55 Q 0,62 0,65"
        fill="none"
        stroke="url(#canalGrad)"
        strokeWidth={active >= 2 ? 4 : 2}
        strokeLinecap="round"
        opacity={active >= 2 ? 1 : 0.3}
        style={{
          transition: "opacity 600ms ease, stroke-width 600ms ease",
          filter: active >= 2 ? "drop-shadow(0 0 6px rgba(242,199,68,0.8))" : "none",
        }}
      />
    </>
  );
}

function ImplantFallback() {
  return (
    <>
      {/* Bone base */}
      <ellipse cx="0" cy="70" rx="100" ry="28" fill="url(#boneGrad)" />
      {/* Screw body */}
      <rect x="-14" y="-10" width="28" height="80" rx="4" fill="url(#metalGrad)" />
      {/* Thread rings */}
      {[0, 18, 36, 54].map((y) => (
        <rect key={y} x="-16" y={-8 + y} width="32" height="4" rx="2" fill="#8b939c" />
      ))}
      {/* Tip cone */}
      <polygon points="-14,70 14,70 0,92" fill="#9aa2ab" />
      {/* Abutment */}
      <rect x="-10" y="-22" width="20" height="14" rx="2" fill="#d4d8dd" />
      {/* Crown */}
      <path
        d="M 0,-105 C -30,-100 -38,-70 -38,-45 C -38,-30 -30,-22 -20,-22 L 20,-22 C 30,-22 38,-30 38,-45 C 38,-70 30,-100 0,-105 Z"
        fill="url(#enamelGrad)"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1"
      />
      {/* Glow */}
      <circle cx="0" cy="40" r="45" fill="#f2c744" opacity="0.12" />
    </>
  );
}

function OmniFallback() {
  // Central tooth + 4 highlighted orbiters
  const points = [
    { x: 70, y: -35, color: "#2e7a99" },
    { x: 70, y: 35, color: "#c9a227" },
    { x: -70, y: 35, color: "#589ab6" },
    { x: -70, y: -35, color: "#e8c97a" },
  ];
  return (
    <>
      {/* Tooth */}
      <path
        d="M 0,-90 C -45,-86 -56,-50 -56,-18 C -56,10 -46,28 -38,54 C -30,80 -20,104 -4,112 C -1,114 1,114 4,112 C 20,104 30,80 38,54 C 46,28 56,10 56,-18 C 56,-50 45,-86 0,-90 Z"
        fill="url(#enamelGrad)"
      />
      {points.map((p, i) => (
        <g key={i}>
          <line
            x1="0"
            y1="10"
            x2={p.x}
            y2={p.y}
            stroke={p.color}
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
          <circle
            cx={p.x}
            cy={p.y}
            r="8"
            fill={p.color}
            style={{ filter: `drop-shadow(0 0 8px ${p.color})` }}
          />
        </g>
      ))}
    </>
  );
}

function PedoFallback() {
  return (
    <>
      {/* Falling milk tooth (upper right) */}
      <g transform="translate(45 -40) rotate(-35)">
        <path
          d="M 0,-50 C -25,-48 -30,-28 -30,-10 C -30,6 -24,16 -20,32 C -16,48 -10,60 -2,64 C 0,65 0,65 2,64 C 10,60 16,48 20,32 C 24,16 30,6 30,-10 C 30,-28 25,-48 0,-50 Z"
          fill="url(#enamelGrad)"
          opacity="0.7"
        />
      </g>
      {/* Emerging permanent tooth (center, growing) */}
      <path
        d="M 0,-90 C -48,-86 -58,-50 -58,-18 C -58,10 -48,28 -40,54 C -32,80 -22,104 -6,112 C -2,114 2,114 6,112 C 22,104 32,80 40,54 C 48,28 58,10 58,-18 C 58,-50 48,-86 0,-90 Z"
        fill="url(#enamelGrad)"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1"
      />
      {/* Sparkles */}
      {[
        { x: -80, y: -60 },
        { x: 85, y: -70 },
        { x: 75, y: 60 },
        { x: -85, y: 55 },
        { x: -30, y: -110 },
        { x: 40, y: -115 },
      ].map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r="3"
          fill="#e8c97a"
          style={{ filter: "drop-shadow(0 0 4px rgba(232,201,122,0.9))" }}
        />
      ))}
    </>
  );
}
