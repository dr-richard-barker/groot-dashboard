import React, { useState } from 'react';
import {
  Layers, Compass, Zap, Dna, Activity, ArrowDown, Shield, Eye, Flame, Scale, Clock, RefreshCw
} from 'lucide-react';

export default function RootDiagram({
  traitName,
  value,
  unit,
  speciesName,
  minVal = 0,
  maxVal = 100,
  q25 = 25,
  median = 50,
  q75 = 75,
  isDark
}) {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  const isDarkMode = isDark !== undefined
    ? isDark
    : (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // WCAG AAA optimized color palette dynamically adapted for dark and light modes
  const c = React.useMemo(() => ({
    textMuted: isDarkMode ? '#94a3b8' : '#475569',
    textSecondary: isDarkMode ? '#cbd5e1' : '#334155',
    soilText: isDarkMode ? '#a36d4a' : '#713f12',
    soilSurfaceText: isDarkMode ? '#a36d4a' : '#78350f',
    skyText: isDarkMode ? '#38bdf8' : '#0369a1',
    emeraldText: isDarkMode ? '#34d399' : '#047857',
    amberText: isDarkMode ? '#fbbf24' : '#b45309',
    tealText: isDarkMode ? '#54c9ba' : '#0f766e',
    purpleText: isDarkMode ? '#c084fc' : '#6b21a8',
    pinkText: isDarkMode ? '#f472b6' : '#be185d',
    redText: isDarkMode ? '#f87171' : '#b91c1c',
    blueText: isDarkMode ? '#60a5fa' : '#1d4ed8',
    cellBg: isDarkMode ? '#0f2942' : '#e0f2fe',
    cellBgDark: isDarkMode ? '#1e293b' : '#f1f5f9',
    cellStroke: isDarkMode ? '#3FB6A8' : '#0d9488',
    whiskerLine: isDarkMode ? '#94a3b8' : '#64748b',
  }), [isDarkMode]);

  // Normalize quantitative value between 0.05 and 1.0 for SVG scaling
  const normVal = React.useMemo(() => {
    if (value == null || isNaN(value)) return 0.5;
    if (maxVal === minVal) return 0.5;
    const n = (value - minVal) / (maxVal - minVal);
    return Math.max(0.1, Math.min(1.0, n));
  }, [value, minVal, maxVal]);

  // Determine specific botanical perspective
  const viewMode = React.useMemo(() => {
    const t = (traitName || '').toLowerCase();
    if (t.includes('rooting_depth')) return 'ROOTING_DEPTH';
    if (t.includes('lateral_spread')) return 'LATERAL_SPREAD';
    if (t.includes('root_n_') || t.includes('nitrogen_uptake') || t.includes('c_n_ratio')) return 'NITROGEN_TRANSPORTERS';
    if (t.includes('root_p_') || t.includes('n_p_ratio')) return 'PHOSPHORUS_TRANSPORTERS';
    if (t.includes('root_ca_')) return 'CALCIUM_TRANSPORTERS';
    if (t.includes('root_k_') || t.includes('root_mg_') || t.includes('root_mn_')) return 'CATION_TRANSPORTERS';
    if (t.includes('cortex') || t.includes('stele') || t.includes('vessel') || t.includes('mean_root_diameter')) return 'ANATOMICAL_CROSS_SECTION';
    if (t.includes('branching')) return 'BRANCHING_ARCHITECTURE';
    if (t.includes('specific_root_length') || t.includes('specific_root_area')) return 'ROOT_ECONOMICS_SRL';
    if (t.includes('mycorrhizal')) return 'MYCORRHIZA_SYMBIOSIS';
    if (t.includes('lifespan') || t.includes('turnover') || t.includes('loss_rate') || t.includes('production')) return 'LIFESPAN_TURNOVER';
    if (t.includes('respiration')) return 'RESPIRATION_METABOLIC';
    return 'TISSUE_DENSITY';
  }, [traitName]);

  const viewMetadata = {
    ROOTING_DEPTH: { label: 'Soil Profile & Underground Depth Boxplot', icon: ArrowDown, color: isDarkMode ? '#38bdf8' : '#0284c7', category: 'Ecosystem & Soil Profile' },
    LATERAL_SPREAD: { label: 'Radial Root Crown & Spread Caliper', icon: Compass, color: isDarkMode ? '#34d399' : '#059669', category: 'Root Spatial Extent' },
    NITROGEN_TRANSPORTERS: { label: 'Nitrogen Transporters (NRT1.1, NRT2.1, AMT1)', icon: Zap, color: isDarkMode ? '#60a5fa' : '#2563eb', category: 'Plasma Membrane Transport' },
    PHOSPHORUS_TRANSPORTERS: { label: 'Phosphate Transporters (PHT1) & Root Hairs', icon: Zap, color: isDarkMode ? '#fbbf24' : '#d97706', category: 'Plasma Membrane Transport' },
    CALCIUM_TRANSPORTERS: { label: 'Calcium Channels (CNGC) & Casparian Barrier', icon: Shield, color: isDarkMode ? '#c084fc' : '#7c3aed', category: 'Membrane & Apoplast Barrier' },
    CATION_TRANSPORTERS: { label: 'Cation Transporters (AKT1, HAK5, MRS2, NRAMP)', icon: Zap, color: isDarkMode ? '#f472b6' : '#db2777', category: 'Membrane Transport' },
    ANATOMICAL_CROSS_SECTION: { label: 'Anatomical Layers (Cortex, Endodermis, Stele, Xylem)', icon: Layers, color: isDarkMode ? '#3FB6A8' : '#0d9488', category: 'Cellular Plant Anatomy' },
    BRANCHING_ARCHITECTURE: { label: 'Developmental Branching & Pericycle Primordia', icon: Dna, color: isDarkMode ? '#54c9ba' : '#0f766e', category: 'Root Developmental Topology' },
    ROOT_ECONOMICS_SRL: { label: 'Root Economics Spectrum (RES: Acquisitive vs Conservative)', icon: Scale, color: isDarkMode ? '#2dd4bf' : '#0d9488', category: 'Functional Plant Ecology' },
    MYCORRHIZA_SYMBIOSIS: { label: 'Arbuscular Mycorrhizal Colonization & Exchange', icon: Dna, color: isDarkMode ? '#a78bfa' : '#6d28d9', category: 'Plant-Microbe Symbiosis' },
    LIFESPAN_TURNOVER: { label: 'Phenological Aging, Turnover Dial & Decay Curve', icon: Clock, color: isDarkMode ? '#fb923c' : '#ea580c', category: 'Phenology & Nutrient Cycling' },
    RESPIRATION_METABOLIC: { label: 'Mitochondrial Respiration & Rhizosphere CO₂ Flux', icon: Flame, color: isDarkMode ? '#f87171' : '#dc2626', category: 'Plant Cellular Respiration' },
    TISSUE_DENSITY: { label: 'Cellular Lignification & Dry Matter Packing', icon: Activity, color: isDarkMode ? '#3B6EA5' : '#1d4ed8', category: 'Cell Wall Composition' }
  };

  const meta = viewMetadata[viewMode] || viewMetadata.TISSUE_DENSITY;
  const MetaIcon = meta.icon;

  return (
    <div className="bg-white dark:bg-[#161d27] border border-slate-200 dark:border-[#232c39] rounded-2xl p-5 shadow-lg relative flex flex-col justify-between transition-colors">
      {/* Diagram Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2 truncate">
          <MetaIcon className="w-5 h-5 flex-shrink-0" style={{ color: meta.color }} />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#e6ebf2] block truncate">
              {meta.label}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-[#9aa6b6]">
              {meta.category}
            </span>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-blue-50 dark:bg-[#3B6EA5]/20 text-blue-700 dark:text-[#6ea3d8] border border-blue-200 dark:border-[#3B6EA5]/40 flex-shrink-0 ml-2">
          ggPlantmap Engine
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-72 bg-slate-50 dark:bg-[#0f141b] rounded-xl border border-slate-200 dark:border-[#232c39] flex items-center justify-center p-2 overflow-hidden shadow-inner">

        {/* 1. ROOTING DEPTH WITH UNDERGROUND SOIL STRATA & VERTICAL BOXPLOT */}
        {viewMode === 'ROOTING_DEPTH' && (
          <svg viewBox="0 0 320 260" className="w-full h-full">
            {/* Soil Strata Horizons */}
            <rect x="0" y="30" width="320" height="35" fill="#452c1e" opacity={isDarkMode ? 0.4 : 0.15} />
            <text x="8" y="52" fill={c.soilText} fontSize="8" fontWeight="bold">Horizon O (Organic litter)</text>

            <rect x="0" y="65" width="320" height="55" fill="#3d271d" opacity={isDarkMode ? 0.3 : 0.12} />
            <text x="8" y="95" fill={c.soilText} fontSize="8" fontWeight="bold">Horizon A (Topsoil / Rhizosphere)</text>

            <rect x="0" y="120" width="320" height="70" fill="#2d1d16" opacity={isDarkMode ? 0.25 : 0.09} />
            <text x="8" y="155" fill={c.soilText} fontSize="8" fontWeight="bold">Horizon B (Subsoil accumulation)</text>

            <rect x="0" y="190" width="320" height="70" fill="#1f140f" opacity={isDarkMode ? 0.2 : 0.06} />
            <text x="8" y="225" fill={c.soilText} fontSize="8" fontWeight="bold">Horizon C (Weathered substratum)</text>

            {/* Soil Surface Line */}
            <line x1="0" y1="30" x2="320" y2="30" stroke={isDarkMode ? '#87563e' : '#a16207'} strokeWidth="2.5" />
            <text x="110" y="22" fill={c.soilSurfaceText} fontSize="10" fontWeight="bold">Soil Surface (0 m)</text>

            {/* Taproot Elongating into Soil Horizons */}
            {(() => {
              const rootDepthY = 30 + normVal * 200;
              return (
                <g>
                  {/* Stem base */}
                  <path d="M 125 10 L 125 30 M 135 10 L 135 30" stroke="#34d399" strokeWidth="3" />
                  <path d="M 115 12 Q 130 18 145 12" stroke="#34d399" strokeWidth="2" fill="none" />

                  {/* Dynamic Taproot */}
                  <path
                    d={`M 130 30 Q 133 ${30 + (rootDepthY - 30) * 0.4} 129 ${30 + (rootDepthY - 30) * 0.7} Q 131 ${rootDepthY - 10} 130 ${rootDepthY}`}
                    fill="none"
                    stroke="#54c9ba"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    onMouseEnter={() => setHoveredRegion(`Rooting Tip reaching depth: ${value != null ? value : 0} ${unit}`)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className="cursor-pointer"
                  />

                  {/* Lateral Roots */}
                  {[0.25, 0.45, 0.65, 0.8].map((f, i) => {
                    const ly = 30 + (rootDepthY - 30) * f;
                    const len = Math.max(15, 35 * (1 - f * 0.5));
                    return (
                      <g key={i}>
                        <path d={`M 130 ${ly} Q ${130 - len * 0.6} ${ly + 6} ${130 - len} ${ly + 12}`} fill="none" stroke={isDarkMode ? '#6ea3d8' : '#2563eb'} strokeWidth="1.8" />
                        <path d={`M 130 ${ly} Q ${130 + len * 0.6} ${ly + 6} ${130 + len} ${ly + 12}`} fill="none" stroke={isDarkMode ? '#6ea3d8' : '#2563eb'} strokeWidth="1.8" />
                      </g>
                    );
                  })}

                  {/* Root Tip Caliper Pointer */}
                  <line x1="135" y1={rootDepthY} x2="165" y2={rootDepthY} stroke={c.skyText} strokeWidth="1.5" strokeDasharray="2 2" />
                  <circle cx={rootDepthY ? 130 : 130} cy={rootDepthY} r="3" fill={c.skyText} />
                  <text x="170" y={rootDepthY + 3} fill={c.skyText} fontSize="9" fontWeight="extrabold">
                    {value} {unit}
                  </text>
                </g>
              );
            })()}

            {/* UNDERGROUND VERTICAL BOXPLOT / DISTRIBUTION ENVELOPE (Requested by user) */}
            {(() => {
              const boxX = 250;
              const boxWidth = 24;
              const scaleY = (v) => 30 + ((v - minVal) / (maxVal - minVal || 1)) * 200;
              const yMin = 30;
              const yQ1 = scaleY(q25);
              const yMed = scaleY(median);
              const yQ3 = scaleY(q75);
              const yMax = scaleY(maxVal);

              return (
                <g
                  onMouseEnter={() => setHoveredRegion(`Rooting Depth Distribution (Min: ${minVal}m, Q1: ${q25}m, Median: ${median}m, Q3: ${q75}m, Max: ${maxVal}m)`)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  className="cursor-pointer"
                >
                  {/* Whisker Line */}
                  <line x1={boxX + boxWidth / 2} y1={yMin} x2={boxX + boxWidth / 2} y2={yMax} stroke={c.whiskerLine} strokeWidth="1.5" />
                  {/* Whisker Caps */}
                  <line x1={boxX + 4} y1={yMin} x2={boxX + boxWidth - 4} y2={yMin} stroke={c.whiskerLine} strokeWidth="1.5" />
                  <line x1={boxX + 4} y1={yMax} x2={boxX + boxWidth - 4} y2={yMax} stroke={c.whiskerLine} strokeWidth="1.5" />

                  {/* IQR Box (Q1 to Q3) */}
                  <rect
                    x={boxX}
                    y={Math.min(yQ1, yQ3)}
                    width={boxWidth}
                    height={Math.max(6, Math.abs(yQ3 - yQ1))}
                    fill="#3B6EA5"
                    fillOpacity={isDarkMode ? 0.45 : 0.25}
                    stroke={isDarkMode ? '#6ea3d8' : '#2563eb'}
                    strokeWidth="1.5"
                    rx="3"
                  />

                  {/* Median Line */}
                  <line x1={boxX} y1={yMed} x2={boxX + boxWidth} y2={yMed} stroke={c.emeraldText} strokeWidth="2.5" />

                  {/* Annotations */}
                  <text x={boxX - 6} y={yMed + 3} fill={c.emeraldText} fontSize="8" fontWeight="bold" textAnchor="end">
                    Median
                  </text>
                  <text x={boxX + boxWidth + 4} y={38} fill={c.textMuted} fontSize="8">
                    0 m
                  </text>
                  <text x={boxX + boxWidth + 4} y={yMax} fill={c.textMuted} fontSize="8">
                    {maxVal}m
                  </text>
                  <text x={boxX - 5} y={18} fill={c.blueText} fontSize="8" fontWeight="bold">
                    Depth Boxplot
                  </text>
                </g>
              );
            })()}
          </svg>
        )}

        {/* 2. LATERAL SPREAD RADIAL CALIPER */}
        {viewMode === 'LATERAL_SPREAD' && (
          <svg viewBox="0 0 320 260" className="w-full h-full">
            {/* Crown Center Stem */}
            <circle cx="160" cy="130" r="12" fill="#3B6EA5" stroke="#ffffff" strokeWidth="2" />
            <text x="160" y="133" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">Plant Axis</text>

            {/* Radial Concentric Calipers */}
            {[0.3, 0.6, 0.85, 1.0].map((rFactor, idx) => {
              const radius = 25 + rFactor * 85 * normVal;
              return (
                <circle
                  key={idx}
                  cx="160"
                  cy="130"
                  r={radius}
                  fill="none"
                  stroke="#3FB6A8"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  opacity={0.3 + idx * 0.2}
                />
              );
            })}

            {/* Lateral Root Rays spreading horizontally */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              const r = 25 + 85 * normVal;
              const ex = 160 + Math.cos(rad) * r;
              const ey = 130 + Math.sin(rad) * r;
              return (
                <line
                  key={idx}
                  x1="160"
                  y1="130"
                  x2={ex}
                  y2={ey}
                  stroke="#54c9ba"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Horizontal Caliper Bracket & Radius Callout */}
            <line x1="160" y1="235" x2={160 + 25 + 85 * normVal} y2="235" stroke="#fbbf24" strokeWidth="2" />
            <line x1="160" y1="230" x2="160" y2="240" stroke={c.amberText} strokeWidth="2" />
            <line x1={160 + 25 + 85 * normVal} y1="230" x2={160 + 25 + 85 * normVal} y2="240" stroke={c.amberText} strokeWidth="2" />
            <text x={160 + (25 + 85 * normVal) / 2} y="250" fill={c.amberText} fontSize="10" fontWeight="bold" textAnchor="middle">
              Radial Spread: {value} {unit}
            </text>
          </svg>
        )}

        {/* 3. NITROGEN TRANSPORTERS (Real: NRT1.1/NPF6.3, NRT2.1-NAR2.1, AMT1.1, PM H+-ATPase) */}
        {viewMode === 'NITROGEN_TRANSPORTERS' && (
          <svg viewBox="0 0 320 260" className="w-full h-full">
            {/* Plasma Membrane Bilayer */}
            <rect x="20" y="95" width="280" height="60" rx="6" fill={c.cellBg} stroke={c.cellStroke} strokeWidth="2" />
            <text x="30" y="85" fill={c.textMuted} fontSize="9" fontWeight="extrabold">SOIL SOLUTION / RHIZOSPHERE (Apoplast)</text>
            <text x="30" y="175" fill={c.textMuted} fontSize="9" fontWeight="extrabold">ROOT CYTOPLASM (Symplast)</text>

            {/* NRT1.1 / CHL1 (NPF6.3) Dual-Affinity Nitrate Transceptor */}
            <g
              onMouseEnter={() => setHoveredRegion('NRT1.1 / CHL1 (NPF6.3): Dual-affinity nitrate sensor & transporter facilitating NO₃⁻ uptake across soil gradients')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            >
              <rect x="35" y="80" width="48" height="90" rx="8" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
              <text x="59" y="125" fill="#ffffff" fontSize="9" fontWeight="extrabold" textAnchor="middle">NRT1.1</text>
              <text x="59" y="138" fill="#93c5fd" fontSize="7" textAnchor="middle">NPF6.3</text>
              {/* Nitrate Flux arrow */}
              <path d="M 59 40 L 59 75 M 54 68 L 59 75 L 64 68" stroke="#60a5fa" strokeWidth="2.5" fill="none" />
              <text x="59" y="32" fill="#60a5fa" fontSize="10" fontWeight="bold" textAnchor="middle">NO₃⁻</text>
            </g>

            {/* NRT2.1 High-Affinity Nitrate Transporter with NAR2.1 co-factor */}
            <g
              onMouseEnter={() => setHoveredRegion('NRT2.1 / NAR2.1: High-affinity 2H⁺/NO₃⁻ symporter dominant in low nitrogen soil conditions')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            >
              <rect x="100" y="80" width="48" height="90" rx="8" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
              <text x="124" y="125" fill="#ffffff" fontSize="9" fontWeight="extrabold" textAnchor="middle">NRT2.1</text>
              <text x="124" y="138" fill="#bae6fd" fontSize="7" textAnchor="middle">+NAR2.1</text>
              <path d="M 124 40 L 124 75 M 119 68 L 124 75 L 129 68" stroke="#38bdf8" strokeWidth="2.5" fill="none" />
              <text x="124" y="32" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">2H⁺ : NO₃⁻</text>
            </g>

            {/* AMT1.1 Ammonium Transporter */}
            <g
              onMouseEnter={() => setHoveredRegion('AMT1.1 / AMT1.2: High-affinity ammonium channel (NH₄⁺) mediating electrogenic cation uptake')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            >
              <rect x="165" y="80" width="48" height="90" rx="8" fill="#065f46" stroke="#34d399" strokeWidth="2" />
              <text x="189" y="125" fill="#ffffff" fontSize="9" fontWeight="extrabold" textAnchor="middle">AMT1.1</text>
              <text x="189" y="138" fill="#a7f3d0" fontSize="7" textAnchor="middle">Channel</text>
              <path d="M 189 40 L 189 75 M 184 68 L 189 75 L 194 68" stroke="#34d399" strokeWidth="2.5" fill="none" />
              <text x="189" y="32" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">NH₄⁺</text>
            </g>

            {/* Plasma Membrane H+-ATPase (The Proton Engine) */}
            <g
              onMouseEnter={() => setHoveredRegion('PM H⁺-ATPase (AHA2): Pumps protons out to generate the transmembrane electrochemical proton motive force')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            >
              <rect x="230" y="80" width="55" height="90" rx="8" fill="#7c2d12" stroke="#fb923c" strokeWidth="2" />
              <text x="257" y="120" fill="#ffffff" fontSize="9" fontWeight="extrabold" textAnchor="middle">PM H⁺</text>
              <text x="257" y="132" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">ATPase</text>
              <text x="257" y="145" fill="#fed7aa" fontSize="7" textAnchor="middle">ATP → ADP</text>
              {/* Protons pumped outwards */}
              <path d="M 257 205 L 257 175 M 252 182 L 257 175 L 262 182" stroke="#fb923c" strokeWidth="2.5" fill="none" />
              <text x="257" y="222" fill="#fb923c" fontSize="10" fontWeight="bold" textAnchor="middle">H⁺ (out)</text>
            </g>

            {/* Quantitative Flux Indicator */}
            <text x="160" y="245" fill={c.skyText} fontSize="11" fontWeight="bold" textAnchor="middle">
              Nitrogen Trait Level: {value} {unit}
            </text>
          </svg>
        )}

        {/* 4. PHOSPHORUS TRANSPORTERS (PHT1 family & Root Hair Acid Phosphatases) */}
        {viewMode === 'PHOSPHORUS_TRANSPORTERS' && (
          <svg viewBox="0 0 320 260" className="w-full h-full">
            {/* Epidermal Root Hair Cell Outgrowth */}
            <path
              d="M 20 50 Q 80 50 100 130 Q 110 200 60 210 L 20 210 Z"
              fill={c.cellBgDark}
              stroke={isDarkMode ? '#fbbf24' : '#d97706'}
              strokeWidth="2"
            />
            {/* Root Hair Tube Extension */}
            <path
              d="M 100 110 C 180 100 240 105 285 110 C 285 130 240 135 100 125"
              fill={c.cellBg}
              stroke={isDarkMode ? '#fbbf24' : '#d97706'}
              strokeWidth="2"
            />
            <text x="175" y="95" fill={c.amberText} fontSize="9" fontWeight="bold">Root Hair Tip (High P Acquisition)</text>

            {/* PHT1;1 / PHT1;4 Transporters on Root Hair Membrane */}
            <g
              onMouseEnter={() => setHoveredRegion('PHT1;1 & PHT1;4: High-affinity H⁺/H₂PO₄⁻ symporters active at the root hair apex')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            >
              <rect x="250" y="92" width="28" height="42" rx="6" fill="#b45309" stroke="#ffffff" strokeWidth="1.5" />
              <text x="264" y="116" fill="#ffffff" fontSize="8" fontWeight="extrabold" textAnchor="middle">PHT1</text>
              {/* Phosphate influx */}
              <path d="M 305 113 L 282 113 M 288 108 L 282 113 L 288 118" stroke={c.amberText} strokeWidth="2" fill="none" />
              <text x="308" y="116" fill={c.amberText} fontSize="9" fontWeight="bold">H₂PO₄⁻</text>
            </g>

            {/* Secreted Acid Phosphatase enzyme bubble */}
            <g
              onMouseEnter={() => setHoveredRegion('Purple Acid Phosphatase (PAP): Exuded into rhizosphere to hydrolyze organic phosphorus')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            >
              <circle cx="190" cy="65" r="14" fill="#7c3aed" opacity="0.8" />
              <text x="190" y="68" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle">PAPase</text>
              <text x="190" y="44" fill={c.purpleText} fontSize="8" textAnchor="middle">Organic P Cleavage</text>
            </g>

            <text x="160" y="245" fill={c.amberText} fontSize="11" fontWeight="bold" textAnchor="middle">
              Phosphorus Trait Level: {value} {unit}
            </text>
          </svg>
        )}

        {/* 5. CALCIUM CHANNELS & CASPARIAN STRIP BARRIER */}
        {viewMode === 'CALCIUM_TRANSPORTERS' && (
          <svg viewBox="0 0 320 260" className="w-full h-full">
            {/* Endodermal Cell with Suberized Casparian Strip */}
            <rect x="60" y="60" width="200" height="130" rx="8" fill={c.cellBgDark} stroke={isDarkMode ? '#38bdf8' : '#0284c7'} strokeWidth="2" />
            <text x="160" y="80" fill={c.textSecondary} fontSize="10" fontWeight="bold" textAnchor="middle">Endodermal Cell</text>

            {/* The Casparian Strip (Apoplastic Blockade) */}
            <rect
              x="245"
              y="55"
              width="25"
              height="140"
              rx="4"
              fill="#b91c1c"
              stroke="#ef4444"
              strokeWidth="2"
              onMouseEnter={() => setHoveredRegion('Casparian Strip: Suberin / lignin impregnation blocking apoplastic Ca²⁺ diffusion into stele')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            />
            <text x="257" y="130" fill="#ffffff" fontSize="8" fontWeight="extrabold" transform="rotate(-90 257 130)" textAnchor="middle">
              CASPARIAN STRIP
            </text>

            {/* CNGC14 / CNGC15 Influx Channel */}
            <g
              onMouseEnter={() => setHoveredRegion('CNGC14 / CNGC15: Cyclic nucleotide-gated channels mediating Ca²⁺ influx')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            >
              <rect x="45" y="90" width="30" height="40" rx="5" fill="#7e22ce" stroke="#ffffff" strokeWidth="1.5" />
              <text x="60" y="114" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">CNGC</text>
              <path d="M 15 110 L 42 110 M 35 105 L 42 110 L 35 115" stroke="#c084fc" strokeWidth="2" fill="none" />
              <text x="15" y="103" fill={c.purpleText} fontSize="9" fontWeight="bold">Ca²⁺</text>
            </g>

            {/* ACA8 / ACA10 Plasma Membrane Ca2+-ATPase */}
            <g
              onMouseEnter={() => setHoveredRegion('ACA8 / ACA10: P-type Ca²⁺-ATPase pumping Ca²⁺ out to maintain low resting cytosolic [Ca²⁺]')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            >
              <rect x="45" y="145" width="30" height="40" rx="5" fill="#4338ca" stroke="#ffffff" strokeWidth="1.5" />
              <text x="60" y="168" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">ACA8</text>
              <text x="160" y="145" fill={c.textMuted} fontSize="8" textAnchor="middle">Symplastic Ca²⁺ Filtering</text>
            </g>

            <text x="160" y="245" fill={c.purpleText} fontSize="11" fontWeight="bold" textAnchor="middle">
              Root Calcium Concentration: {value} {unit}
            </text>
          </svg>
        )}

        {/* 6. CATION TRANSPORTERS (K, Mg, Mn: AKT1, HAK5, MRS2, NRAMP) */}
        {viewMode === 'CATION_TRANSPORTERS' && (
          <svg viewBox="0 0 320 260" className="w-full h-full">
            <rect x="20" y="90" width="280" height="65" rx="6" fill={c.cellBg} stroke={c.cellStroke} strokeWidth="2" />
            <text x="30" y="78" fill={c.textMuted} fontSize="9" fontWeight="bold">RHIZOSPHERE</text>
            <text x="30" y="175" fill={c.textMuted} fontSize="9" fontWeight="bold">CYTOPLASM</text>

            {/* AKT1 Channel */}
            <g onMouseEnter={() => setHoveredRegion('AKT1: Inward-rectifying K⁺ channel activated by CIPK23/CBL1')} onMouseLeave={() => setHoveredRegion(null)} className="cursor-pointer">
              <rect x="40" y="78" width="55" height="90" rx="8" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="2" />
              <text x="67" y="125" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">AKT1 (K⁺)</text>
              <path d="M 67 40 L 67 75 M 62 68 L 67 75 L 72 68" stroke="#93c5fd" strokeWidth="2.5" fill="none" />
              <text x="67" y="32" fill="#93c5fd" fontSize="10" fontWeight="bold" textAnchor="middle">K⁺ (mM)</text>
            </g>

            {/* HAK5 High Affinity Symporter */}
            <g onMouseEnter={() => setHoveredRegion('HAK5: High-affinity K⁺/H⁺ symporter for micromolar soil potassium')} onMouseLeave={() => setHoveredRegion(null)} className="cursor-pointer">
              <rect x="108" y="78" width="55" height="90" rx="8" fill="#0284c7" stroke="#7dd3fc" strokeWidth="2" />
              <text x="135" y="125" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">HAK5 (K⁺)</text>
              <path d="M 135 40 L 135 75 M 130 68 L 135 75 L 140 68" stroke="#7dd3fc" strokeWidth="2.5" fill="none" />
              <text x="135" y="32" fill="#7dd3fc" fontSize="10" fontWeight="bold" textAnchor="middle">K⁺ (µM)</text>
            </g>

            {/* MRS2 / MGT Magnesium Transporter */}
            <g onMouseEnter={() => setHoveredRegion('MRS2 / MGT1: CorA-type magnesium ion transporter for Mg²⁺ uptake')} onMouseLeave={() => setHoveredRegion(null)} className="cursor-pointer">
              <rect x="175" y="78" width="55" height="90" rx="8" fill="#059669" stroke="#6ee7b7" strokeWidth="2" />
              <text x="202" y="125" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">MRS2 (Mg)</text>
              <path d="M 202 40 L 202 75 M 197 68 L 202 75 L 207 68" stroke="#6ee7b7" strokeWidth="2.5" fill="none" />
              <text x="202" y="32" fill="#6ee7b7" fontSize="10" fontWeight="bold" textAnchor="middle">Mg²⁺</text>
            </g>

            {/* NRAMP1 Manganese Transporter */}
            <g onMouseEnter={() => setHoveredRegion('NRAMP1: Natural resistance-associated macrophage protein mediating Mn²⁺/Fe²⁺ transport')} onMouseLeave={() => setHoveredRegion(null)} className="cursor-pointer">
              <rect x="242" y="78" width="55" height="90" rx="8" fill="#be185d" stroke="#fbcfe8" strokeWidth="2" />
              <text x="269" y="125" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">NRAMP1</text>
              <path d="M 269 40 L 269 75 M 264 68 L 269 75 L 274 68" stroke="#fbcfe8" strokeWidth="2.5" fill="none" />
              <text x="269" y="32" fill="#fbcfe8" fontSize="10" fontWeight="bold" textAnchor="middle">Mn²⁺</text>
            </g>

            <text x="160" y="245" fill={c.pinkText} fontSize="11" fontWeight="bold" textAnchor="middle">
              Cation Trait Level: {value} {unit}
            </text>
          </svg>
        )}

        {/* 7. ANATOMICAL CROSS-SECTION (Epidermis, Cortex cell files, Endodermis, Pericycle, Metaxylem Vessels) */}
        {viewMode === 'ANATOMICAL_CROSS_SECTION' && (
          <svg viewBox="0 0 320 260" className="w-full h-full">
            {/* Epidermis & Root Hairs */}
            <circle
              cx="160"
              cy="125"
              r={95 + normVal * 20}
              fill={c.cellBgDark}
              stroke={isDarkMode ? '#38bdf8' : '#0284c7'}
              strokeWidth="2"
              onMouseEnter={() => setHoveredRegion('Epidermis (Rhizodermis): Single outer cell layer with active root hair outgrowth')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            />
            {/* Root Hairs radiating outwards */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const r1 = 95 + normVal * 20;
              const r2 = r1 + 14;
              return (
                <line
                  key={i}
                  x1={160 + Math.cos(rad) * r1}
                  y1={125 + Math.sin(rad) * r1}
                  x2={160 + Math.cos(rad) * r2}
                  y2={125 + Math.sin(rad) * r2}
                  stroke={isDarkMode ? '#38bdf8' : '#0284c7'}
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Cortex Cell Files */}
            <circle
              cx="160"
              cy="125"
              r={70 + normVal * 15}
              fill={c.cellBg}
              stroke={c.cellStroke}
              strokeWidth="2"
              onMouseEnter={() => setHoveredRegion(`Cortex Layer: Parenchymal tissue storing carbohydrates (Thickness: ${value} ${unit})`)}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            />

            {/* Endodermis Ring with Casparian Strip */}
            <circle
              cx="160"
              cy="125"
              r={45}
              fill={isDarkMode ? '#1e1e38' : '#fee2e2'}
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              onMouseEnter={() => setHoveredRegion('Endodermis with Suberized Casparian Strip: Physiological barrier for water and solute gating')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            />

            {/* Pericycle Ring */}
            <circle
              cx="160"
              cy="125"
              r={36}
              fill={isDarkMode ? '#312e81' : '#ede9fe'}
              stroke={isDarkMode ? '#a78bfa' : '#7c3aed'}
              strokeWidth="1.5"
              onMouseEnter={() => setHoveredRegion('Pericycle: Outermost layer of stele where lateral root primordia initiate')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            />

            {/* Vascular Stele Core */}
            <circle cx="160" cy="125" r="30" fill={isDarkMode ? '#1e1b4b' : '#e0e7ff'} />

            {/* Metaxylem Central Vessels (Dynamic count & size) */}
            {(() => {
              const numVessels = Math.max(3, Math.min(8, Math.round(3 + normVal * 5)));
              const vesselRadius = Math.max(3, 4 + normVal * 4);
              return [...Array(numVessels)].map((_, idx) => {
                const angle = (idx * (360 / numVessels) * Math.PI) / 180;
                const vx = 160 + Math.cos(angle) * 16;
                const vy = 125 + Math.sin(angle) * 16;
                return (
                  <circle
                    key={idx}
                    cx={vx}
                    cy={vy}
                    r={vesselRadius}
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="1"
                    onMouseEnter={() => setHoveredRegion(`Metaxylem Vessel (Lumen Diameter: ${value} ${unit})`)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className="cursor-pointer hover:scale-125 transition-transform"
                  />
                );
              });
            })()}

            {/* Central Metaxylem Vessel */}
            <circle cx="160" cy="125" r={5 + normVal * 4} fill="#60a5fa" stroke="#ffffff" strokeWidth="1" />

            {/* Caliper Annotations */}
            <line x1="160" y1="125" x2="265" y2="45" stroke={c.tealText} strokeWidth="1.5" strokeDasharray="2 2" />
            <text x="270" y="45" fill={c.tealText} fontSize="9" fontWeight="bold">Cortex Cell Layer</text>

            <line x1="160" y1="125" x2="55" y2="45" stroke={c.purpleText} strokeWidth="1.5" strokeDasharray="2 2" />
            <text x="10" y="45" fill={c.purpleText} fontSize="9" fontWeight="bold">Stele & Metaxylem</text>
          </svg>
        )}

        {/* 8. BRANCHING ARCHITECTURE WITH DEVELOPMENTAL ZONES & 1 CM SCALE */}
        {viewMode === 'BRANCHING_ARCHITECTURE' && (
          <svg viewBox="0 0 320 260" className="w-full h-full">
            {/* Developmental Zones */}
            <rect x="15" y="30" width="85" height="60" rx="4" fill={c.cellBg} opacity={0.6} />
            <text x="20" y="48" fill={c.skyText} fontSize="8" fontWeight="bold">Maturation Zone</text>
            <text x="20" y="60" fill={c.textMuted} fontSize="7">Lateral root emergence</text>

            <rect x="15" y="95" width="85" height="50" rx="4" fill={c.cellBgDark} opacity={0.6} />
            <text x="20" y="112" fill={c.emeraldText} fontSize="8" fontWeight="bold">Elongation Zone</text>
            <text x="20" y="124" fill={c.textMuted} fontSize="7">Rapid cell expansion</text>

            <rect x="15" y="150" width="85" height="50" rx="4" fill={isDarkMode ? '#312e81' : '#ede9fe'} opacity={0.6} />
            <text x="20" y="168" fill={c.purpleText} fontSize="8" fontWeight="bold">Meristematic Zone</text>
            <text x="20" y="180" fill={c.textMuted} fontSize="7">Quiescent center & root cap</text>

            {/* Main Primary Root Axis */}
            <path d="M 180 20 L 180 210 Q 180 230 178 235" stroke="#54c9ba" strokeWidth="5" fill="none" strokeLinecap="round" />
            {/* Root Cap */}
            <path d="M 174 230 Q 180 245 186 230 Z" fill="#c084fc" stroke="#ffffff" strokeWidth="1" />

            {/* Lateral Root Branches from Pericycle (Scaling with Branching Density) */}
            {(() => {
              const numBranches = Math.max(2, Math.min(10, Math.round(2 + normVal * 8)));
              return [...Array(numBranches)].map((_, i) => {
                const by = 40 + i * (110 / numBranches);
                return (
                  <g key={i}>
                    <path d={`M 180 ${by} Q 150 ${by + 8} 125 ${by + 16}`} stroke="#38bdf8" strokeWidth="2" fill="none" />
                    <path d={`M 180 ${by + 6} Q 210 ${by + 14} 245 ${by + 22}`} stroke="#38bdf8" strokeWidth="2" fill="none" />
                  </g>
                );
              });
            })()}

            {/* 1 cm Scale Reference Bracket */}
            <line x1="280" y1="50" x2="280" y2="130" stroke={c.amberText} strokeWidth="2" />
            <line x1="275" y1="50" x2="285" y2="50" stroke={c.amberText} strokeWidth="2" />
            <line x1="275" y1="130" x2="285" y2="130" stroke={c.amberText} strokeWidth="2" />
            <text x="290" y="93" fill={c.amberText} fontSize="9" fontWeight="bold">1 cm scale</text>

            <text x="160" y="250" fill={c.tealText} fontSize="11" fontWeight="bold" textAnchor="middle">
              Branching Metric: {value} {unit}
            </text>
          </svg>
        )}

        {/* 9. ROOT ECONOMICS SPECTRUM (SRL / SRA: Acquisitive vs Conservative Scale) */}
        {viewMode === 'ROOT_ECONOMICS_SRL' && (
          <svg viewBox="0 0 320 260" className="w-full h-full">
            {/* Balance Scale Fulcrum */}
            <polygon points="160,150 145,190 175,190" fill={isDarkMode ? '#475569' : '#94a3b8'} stroke={c.whiskerLine} strokeWidth="1.5" />
            {/* Balance Beam tilted by SRL value */}
            {(() => {
              const tilt = (normVal - 0.5) * 40; // degrees
              const rad = (tilt * Math.PI) / 180;
              const bx1 = 160 - Math.cos(rad) * 110;
              const by1 = 150 - Math.sin(rad) * 110;
              const bx2 = 160 + Math.cos(rad) * 110;
              const by2 = 150 + Math.sin(rad) * 110;

              return (
                <g>
                  <line x1={bx1} y1={by1} x2={bx2} y2={by2} stroke={isDarkMode ? '#38bdf8' : '#0284c7'} strokeWidth="3" />

                  {/* Left Pan: Acquisitive High SRL (Fine, Thin Root Thread) */}
                  <line x1={bx1} y1={by1} x2={bx1} y2={by1 + 35} stroke={c.whiskerLine} strokeWidth="1.5" />
                  <ellipse cx={bx1} cy={by1 + 35} rx="30" ry="10" fill={c.cellBgDark} stroke={c.emeraldText} strokeWidth="1.5" />
                  {/* Fine Root Length Thread */}
                  <path d={`M ${bx1 - 20} ${by1 + 30} Q ${bx1} ${by1 + 15} ${bx1 + 20} ${by1 + 32}`} stroke={c.emeraldText} strokeWidth="1.5" fill="none" />
                  <text x={bx1} y={by1 + 55} fill={c.emeraldText} fontSize="8" fontWeight="bold" textAnchor="middle">ACQUISITIVE</text>
                  <text x={bx1} y={by1 + 65} fill={c.textMuted} fontSize="7" textAnchor="middle">High SRL, Thin diameter</text>

                  {/* Right Pan: Conservative Low SRL (Thick, Dense Root Chunk) */}
                  <line x1={bx2} y1={by2} x2={bx2} y2={by2 + 35} stroke={c.whiskerLine} strokeWidth="1.5" />
                  <ellipse cx={bx2} cy={by2 + 35} rx="30" ry="10" fill={c.cellBgDark} stroke={c.amberText} strokeWidth="1.5" />
                  <rect x={bx2 - 12} y={by2 + 20} width="24" height="12" rx="3" fill="#d97706" />
                  <text x={bx2} y={by2 + 55} fill={c.amberText} fontSize="8" fontWeight="bold" textAnchor="middle">CONSERVATIVE</text>
                  <text x={bx2} y={by2 + 65} fill={c.textMuted} fontSize="7" textAnchor="middle">Low SRL, High longevity</text>
                </g>
              );
            })()}

            <text x="160" y="240" fill={c.tealText} fontSize="11" fontWeight="bold" textAnchor="middle">
              Specific Root Length: {value} {unit}
            </text>
          </svg>
        )}

        {/* 10. MYCORRHIZA SYMBIOSIS (Arbuscules & % Colonization) */}
        {viewMode === 'MYCORRHIZA_SYMBIOSIS' && (
          <svg viewBox="0 0 320 260" className="w-full h-full">
            {/* Cortical Cell Enclosure */}
            <rect x="40" y="50" width="240" height="140" rx="10" fill={c.cellBg} stroke={c.cellStroke} strokeWidth="2" />
            <text x="50" y="70" fill={c.textMuted} fontSize="9" fontWeight="bold">Root Cortical Cell Lumen</text>

            {/* Fungal Appressorium & Penetrating Hypha */}
            <circle cx="50" cy="120" r="10" fill={isDarkMode ? '#a78bfa' : '#7c3aed'} stroke="#ffffff" strokeWidth="1.5" />
            <text x="50" y="103" fill={c.purpleText} fontSize="7" textAnchor="middle">Appressorium</text>
            <path d="M 50 120 L 100 120" stroke={isDarkMode ? '#a78bfa' : '#7c3aed'} strokeWidth="3" />

            {/* Intricate Arbuscule (Site of Carbon for Phosphorus / Nitrogen Exchange) */}
            <g
              onMouseEnter={() => setHoveredRegion('Arbuscule: Finely branched fungal haustorium inside cortical cell for reciprocal nutrient trade')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            >
              <circle cx="160" cy="120" r="45" fill="#7c3aed" opacity={isDarkMode ? 0.3 : 0.15} />
              {/* Branched arbuscular tree */}
              <path d="M 100 120 Q 130 120 150 120" stroke={isDarkMode ? '#c084fc' : '#7c3aed'} strokeWidth="3" fill="none" />
              <path d="M 150 120 Q 170 90 190 85 M 170 100 Q 185 85 205 90" stroke={isDarkMode ? '#c084fc' : '#7c3aed'} strokeWidth="2" fill="none" />
              <path d="M 150 120 Q 170 120 205 120 M 175 120 Q 195 110 215 110" stroke={isDarkMode ? '#c084fc' : '#7c3aed'} strokeWidth="2" fill="none" />
              <path d="M 150 120 Q 170 150 195 155 M 170 140 Q 185 155 205 150" stroke={isDarkMode ? '#c084fc' : '#7c3aed'} strokeWidth="2" fill="none" />

              <text x="180" y="115" fill={isDarkMode ? '#ffffff' : '#4c1d95'} fontSize="9" fontWeight="bold">ARBUSCULE</text>
              <text x="180" y="128" fill={isDarkMode ? '#e9d5ff' : '#6d28d9'} fontSize="7">P / N → Plant</text>
              <text x="180" y="137" fill={isDarkMode ? '#fde047' : '#92400e'} fontSize="7">Sugar / Lipids → Fungus</text>
            </g>

            {/* Percentage Colonization Meter */}
            <rect x="40" y="205" width="240" height="16" rx="4" fill={c.cellBgDark} stroke={isDarkMode ? '#334155' : '#cbd5e1'} />
            <rect x="40" y="205" width={240 * (Math.min(100, value || 0) / 100)} height="16" rx="4" fill={isDarkMode ? '#a78bfa' : '#7c3aed'} />
            <text x="160" y="217" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
              Colonization Rate: {value} %
            </text>
          </svg>
        )}

        {/* 11. LIFESPAN, TURNOVER & DECOMPOSITION DECAY */}
        {viewMode === 'LIFESPAN_TURNOVER' && (
          <svg viewBox="0 0 320 260" className="w-full h-full">
            {/* Phenological Aging Progression */}
            <g>
              {/* Young Active Root (White) */}
              <rect x="30" y="40" width="70" height="50" rx="6" fill={c.cellBgDark} stroke={c.emeraldText} strokeWidth="2" />
              <text x="65" y="60" fill={c.emeraldText} fontSize="8" fontWeight="bold" textAnchor="middle">Active Absorptive</text>
              <text x="65" y="75" fill={isDarkMode ? '#ffffff' : '#0f172a'} fontSize="7" textAnchor="middle">White / Translucent</text>

              {/* Arrow */}
              <path d="M 105 65 L 125 65 M 120 60 L 125 65 L 120 70" stroke={c.whiskerLine} strokeWidth="2" />

              {/* Mature Suberized Root (Brown) */}
              <rect x="130" y="40" width="70" height="50" rx="6" fill="#3d271d" opacity={isDarkMode ? 1 : 0.25} stroke={c.soilText} strokeWidth="2" />
              <text x="165" y="60" fill={c.amberText} fontSize="8" fontWeight="bold" textAnchor="middle">Pioneer Suberized</text>
              <text x="165" y="75" fill={isDarkMode ? '#fed7aa' : '#78350f'} fontSize="7" textAnchor="middle">Secondary growth</text>

              {/* Arrow */}
              <path d="M 205 65 L 225 65 M 220 60 L 225 65 L 220 70" stroke={c.whiskerLine} strokeWidth="2" />

              {/* Senescent / Litter (Fragmenting) */}
              <rect x="230" y="40" width="70" height="50" rx="6" fill={isDarkMode ? '#1c1917' : '#fee2e2'} stroke={c.redText} strokeWidth="2" />
              <text x="265" y="60" fill={c.redText} fontSize="8" fontWeight="bold" textAnchor="middle">Senescent Litter</text>
              <text x="265" y="75" fill={isDarkMode ? '#fca5a5' : '#991b1b'} fontSize="7" textAnchor="middle">Microbial decay</text>
            </g>

            {/* Exponential Decay Curve (e^-kt) for Litter Mass Loss */}
            <g>
              <path d="M 50 200 Q 120 180 180 140 T 280 125" fill="none" stroke={c.amberText} strokeWidth="2.5" />
              <text x="60" y="145" fill={c.amberText} fontSize="9" fontWeight="bold">Mass Loss Decay: e⁻ᵏᵗ</text>
              <text x="60" y="160" fill={c.textMuted} fontSize="8">Annual turnover rate (yr⁻¹)</text>
            </g>

            <text x="160" y="245" fill={c.amberText} fontSize="11" fontWeight="bold" textAnchor="middle">
              Lifespan / Turnover Value: {value} {unit}
            </text>
          </svg>
        )}

        {/* 12. RESPIRATION & METABOLIC FLUX */}
        {viewMode === 'RESPIRATION_METABOLIC' && (
          <svg viewBox="0 0 320 260" className="w-full h-full">
            {/* Root Cell */}
            <rect x="40" y="45" width="240" height="150" rx="12" fill={c.cellBgDark} stroke={c.redText} strokeWidth="2" />

            {/* Mitochondria with Cristae Folds */}
            <ellipse cx="160" cy="120" rx="60" ry="35" fill={isDarkMode ? '#7f1d1d' : '#fee2e2'} stroke={c.redText} strokeWidth="2" />
            <path d="M 120 120 Q 140 100 160 120 Q 180 140 200 120" stroke={isDarkMode ? '#fca5a5' : '#dc2626'} strokeWidth="2" fill="none" />
            <text x="160" y="105" fill={isDarkMode ? '#fca5a5' : '#991b1b'} fontSize="8" fontWeight="bold" textAnchor="middle">MITOCHONDRIA</text>
            <text x="160" y="138" fill={isDarkMode ? '#ffffff' : '#450a0a'} fontSize="8" textAnchor="middle">ATP Synthesis (pmf)</text>

            {/* O2 Influx & CO2 Efflux */}
            <path d="M 60 15 L 85 45 M 78 40 L 85 45 L 87 38" stroke={isDarkMode ? '#38bdf8' : '#0284c7'} strokeWidth="2" fill="none" />
            <text x="60" y="12" fill={c.skyText} fontSize="10" fontWeight="bold">O₂ uptake</text>

            <path d="M 235 45 L 260 15 M 255 22 L 260 15 L 253 15" stroke={c.redText} strokeWidth="2" fill="none" />
            <text x="265" y="12" fill={c.redText} fontSize="10" fontWeight="bold">CO₂ efflux</text>

            <text x="160" y="245" fill={c.redText} fontSize="11" fontWeight="bold" textAnchor="middle">
              Respiration Rate: {value} {unit}
            </text>
          </svg>
        )}

        {/* 13. TISSUE DENSITY & LIGNIFIED CELL WALL PACKING */}
        {viewMode === 'TISSUE_DENSITY' && (
          <svg viewBox="0 0 320 260" className="w-full h-full">
            {/* Hexagonal / Polygonal Cell Wall Matrix */}
            {[...Array(15)].map((_, i) => {
              const row = Math.floor(i / 5);
              const col = i % 5;
              const cx = 50 + col * 55 + (row % 2 === 1 ? 27 : 0);
              const cy = 60 + row * 50;
              const wallThickness = 1.5 + normVal * 4;
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="22"
                  fill={c.cellBg}
                  stroke={normVal > 0.6 ? '#d97706' : '#3B6EA5'}
                  strokeWidth={wallThickness}
                  onMouseEnter={() => setHoveredRegion(`Parenchymal Cell #${i+1}: Secondary cell wall lignification & dry matter packing`)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  className="cursor-pointer hover:opacity-80 transition-all"
                />
              );
            })}
            <text x="160" y="30" fill={c.textMuted} fontSize="9" fontWeight="bold" textAnchor="middle">
              Cell Wall Lignification & Intercellular Porosity
            </text>
            <text x="160" y="245" fill={c.blueText} fontSize="11" fontWeight="bold" textAnchor="middle">
              Tissue Density / Dry Matter: {value} {unit}
            </text>
          </svg>
        )}
      </div>

      {/* Dynamic Hover Tooltip / Status Footer */}
      <div className="mt-3 bg-white dark:bg-[#0f141b] border border-slate-200 dark:border-[#232c39] px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-2 truncate">
          <Eye className="w-4 h-4 text-[#3FB6A8] flex-shrink-0" />
          <span className="text-slate-700 dark:text-[#e6ebf2] font-medium truncate">
            {hoveredRegion ? hoveredRegion : 'Hover over anatomical vector parts to inspect botanical details'}
          </span>
        </div>
        <span className="text-[10px] font-bold text-blue-700 dark:text-[#6ea3d8] flex-shrink-0 ml-2">
          {value != null ? `${value} ${unit || ''}` : 'N/A'}
        </span>
      </div>
    </div>
  );
}
