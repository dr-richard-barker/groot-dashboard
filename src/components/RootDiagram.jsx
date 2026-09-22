import React, { useState } from 'react';
import { Info, Zap, Layers, Compass, Activity, Dna } from 'lucide-react';

export default function RootDiagram({ traitName, value, unit, speciesName, minVal = 0, maxVal = 100 }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Normalize quantitative value between 0.1 and 1.0 for SVG scaling
  const normVal = React.useMemo(() => {
    if (value == null || isNaN(value)) return 0.5;
    if (maxVal === minVal) return 0.5;
    const n = (value - minVal) / (maxVal - minVal);
    return Math.max(0.15, Math.min(1.0, n));
  }, [value, minVal, maxVal]);

  // Determine diagram view perspective based on trait
  const viewType = React.useMemo(() => {
    const t = (traitName || '').toLowerCase();
    if (t.includes('cortex') || t.includes('stele') || t.includes('vessel') || t.includes('diameter')) {
      return 'CROSS_SECTION';
    }
    if (t.includes('concentration') || t.includes('uptake') || t.includes('c_n_ratio') || t.includes('n_p_ratio')) {
      return 'TRANSPORTERS';
    }
    if (t.includes('mycorrhizal') || t.includes('nod')) {
      return 'MYCORRHIZA';
    }
    if (t.includes('density') || t.includes('matter') || t.includes('lignin')) {
      return 'DENSITY';
    }
    return 'ARCHITECTURE';
  }, [traitName]);

  // Helper for rendering view badge
  const viewBadges = {
    CROSS_SECTION: { label: 'Transversal Cross-Section View', icon: Layers, color: '#3FB6A8' },
    TRANSPORTERS: { label: 'Membrane Transporter & Ion Flux View', icon: Zap, color: '#f59e0b' },
    MYCORRHIZA: { label: 'Symbiotic Mycorrhizal View', icon: Dna, color: '#a78bfa' },
    DENSITY: { label: 'Cellular Density & Wall View', icon: Activity, color: '#3B6EA5' },
    ARCHITECTURE: { label: 'Root System Architecture View', icon: Compass, color: '#54c9ba' }
  };

  const badge = viewBadges[viewType] || viewBadges.ARCHITECTURE;
  const BadgeIcon = badge.icon;

  return (
    <div className="bg-[#161d27] dark:bg-[#161d27] light:bg-[#f8fafc] border border-[#232c39] light:border-[#cbd5e1] rounded-2xl p-5 shadow-lg relative flex flex-col justify-between transition-colors">
      {/* Diagram Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <BadgeIcon className="w-5 h-5" style={{ color: badge.color }} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 dark:text-[#e6ebf2] light:text-[#0f172a]">
            {badge.label}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#3B6EA5]/20 text-[#6ea3d8] light:text-[#2563eb] border border-[#3B6EA5]/40">
          ggPlantmap Vector
        </span>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full h-64 bg-[#0f141b] dark:bg-[#0f141b] light:bg-[#ffffff] rounded-xl border border-[#232c39] light:border-[#e2e8f0] flex items-center justify-center p-4 overflow-hidden shadow-inner">
        {/* Render Anatomical Cross-Section */}
        {viewType === 'CROSS_SECTION' && (
          <svg viewBox="0 0 300 240" className="w-full h-full">
            {/* Outer Root Margin (Epidermis) */}
            <circle
              cx="150"
              cy="120"
              r={75 + normVal * 25}
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray={hoveredRegion === 'Epidermis' ? '4 2' : 'none'}
              onMouseEnter={() => setHoveredRegion('Epidermis (Outer Root Boundary)')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer transition-all duration-300 hover:opacity-90"
            />

            {/* Root Cortex Region */}
            <circle
              cx="150"
              cy="120"
              r={55 + normVal * 15}
              fill="#0f2942"
              stroke="#3FB6A8"
              strokeWidth="2"
              onMouseEnter={() => setHoveredRegion(`Cortex (Thickness: ${(value != null ? value : 0)} ${unit || ''})`)}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer transition-all duration-300 hover:opacity-90"
            />

            {/* Endodermis Layer */}
            <circle
              cx="150"
              cy="120"
              r={35 + normVal * 5}
              fill="#161d27"
              stroke="#f59e0b"
              strokeWidth="2"
              onMouseEnter={() => setHoveredRegion('Endodermis & Casparian Strip')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer transition-all duration-300"
            />

            {/* Vascular Stele Core */}
            <circle
              cx="150"
              cy="120"
              r={25 + normVal * 5}
              fill="#312e81"
              stroke="#a78bfa"
              strokeWidth="2"
              onMouseEnter={() => setHoveredRegion(`Stele Core (Diameter: ${(value != null ? value : 0)} ${unit || ''})`)}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer transition-all duration-300"
            />

            {/* Xylem Vessels */}
            {[0, 90, 180, 270].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const vx = 150 + Math.cos(rad) * 12;
              const vy = 120 + Math.sin(rad) * 12;
              return (
                <circle
                  key={i}
                  cx={vx}
                  cy={vy}
                  r={3 + normVal * 3}
                  fill="#6ea3d8"
                  stroke="#ffffff"
                  strokeWidth="1"
                  onMouseEnter={() => setHoveredRegion('Xylem Vessel (Conductive Element)')}
                  onMouseLeave={() => setHoveredRegion(null)}
                  className="cursor-pointer hover:scale-125 transition-transform"
                />
              );
            })}

            {/* Annotation Lines & Dynamic Labels */}
            <line x1="150" y1="120" x2="235" y2="40" stroke="#3FB6A8" strokeWidth="1" strokeDasharray="2 2" />
            <text x="240" y="38" fill="#3FB6A8" fontSize="10" fontWeight="bold">
              Cortex Layer
            </text>

            <line x1="150" y1="120" x2="65" y2="40" stroke="#a78bfa" strokeWidth="1" strokeDasharray="2 2" />
            <text x="15" y="38" fill="#a78bfa" fontSize="10" fontWeight="bold">
              Stele & Vessels
            </text>
          </svg>
        )}

        {/* Render Transporters & Ion Uptake View */}
        {viewType === 'TRANSPORTERS' && (
          <svg viewBox="0 0 300 240" className="w-full h-full">
            {/* Plasma Membrane Layer */}
            <rect
              x="30"
              y="90"
              width="240"
              height="60"
              rx="8"
              fill="#0f2a36"
              stroke="#3FB6A8"
              strokeWidth="2"
              onMouseEnter={() => setHoveredRegion('Plasma Membrane Lipid Bilayer')}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            />
            <text x="40" y="80" fill="#9aa6b6" fontSize="10" fontWeight="bold">
              SOIL SOLUTION (Apoplast)
            </text>
            <text x="40" y="170" fill="#9aa6b6" fontSize="10" fontWeight="bold">
              ROOT CYTOPLASM (Symplast)
            </text>

            {/* Nitrate Transporter NRT1.1 / NRT2.1 */}
            <g
              onMouseEnter={() => setHoveredRegion(`NRT1.1/2.1 Nitrate Transporters (Concentration: ${value} ${unit})`)}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            >
              <rect x="70" y="80" width="30" height="80" rx="6" fill="#3B6EA5" stroke="#ffffff" strokeWidth="1.5" />
              <text x="75" y="125" fill="#ffffff" fontSize="9" fontWeight="extrabold">
                NRT
              </text>
              {/* Flux Arrows */}
              <path d="M 85 45 L 85 75 M 80 68 L 85 75 L 90 68" stroke="#38bdf8" strokeWidth="2" fill="none" />
              <text x="72" y="40" fill="#38bdf8" fontSize="9" fontWeight="bold">NO₃⁻</text>
            </g>

            {/* Phosphate Transporter PHT1 */}
            <g
              onMouseEnter={() => setHoveredRegion(`PHT1 Phosphate Transporters (Concentration: ${value} ${unit})`)}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            >
              <rect x="135" y="80" width="30" height="80" rx="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              <text x="140" y="125" fill="#ffffff" fontSize="9" fontWeight="extrabold">
                PHT
              </text>
              <path d="M 150 45 L 150 75 M 145 68 L 150 75 L 155 68" stroke="#fbbf24" strokeWidth="2" fill="none" />
              <text x="136" y="40" fill="#fbbf24" fontSize="9" fontWeight="bold">PO₄³⁻</text>
            </g>

            {/* Calcium Channel CNGC */}
            <g
              onMouseEnter={() => setHoveredRegion(`CNGC / Annexin Ca²⁺ Channels (Concentration: ${value} ${unit})`)}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer"
            >
              <rect x="200" y="80" width="30" height="80" rx="6" fill="#a78bfa" stroke="#ffffff" strokeWidth="1.5" />
              <text x="204" y="125" fill="#ffffff" fontSize="9" fontWeight="extrabold">
                Ca²⁺
              </text>
              <path d="M 215 45 L 215 75 M 210 68 L 215 75 L 220 68" stroke="#c084fc" strokeWidth="2" fill="none" />
              <text x="206" y="40" fill="#c084fc" fontSize="9" fontWeight="bold">Ca²⁺</text>
            </g>
          </svg>
        )}

        {/* Render Root System Architecture (RSA) Perspective */}
        {viewType === 'ARCHITECTURE' && (
          <svg viewBox="0 0 300 240" className="w-full h-full">
            {/* Soil Line */}
            <line x1="20" y1="30" x2="280" y2="30" stroke="#704838" strokeWidth="3" strokeDasharray="6 3" />
            <text x="25" y="24" fill="#a36d4a" fontSize="10" fontWeight="bold">Soil Surface</text>

            {/* Primary Taproot (Dynamic Length & Width) */}
            <path
              d={`M 150 30 Q ${150 + Math.sin(normVal * 5) * 10} ${30 + normVal * 90} 150 ${30 + normVal * 170}`}
              fill="none"
              stroke="#54c9ba"
              strokeWidth={Math.max(2, normVal * 8)}
              onMouseEnter={() => setHoveredRegion(`Primary Taproot (Diameter: ${value || ''} ${unit || ''})`)}
              onMouseLeave={() => setHoveredRegion(null)}
              className="cursor-pointer transition-all duration-300"
            />

            {/* Lateral Branching Roots */}
            {[0.3, 0.5, 0.7, 0.85].map((factor, i) => {
              const py = 30 + normVal * 170 * factor;
              const len = 30 + normVal * 60;
              return (
                <g key={i}>
                  {/* Left Branch */}
                  <path
                    d={`M 150 ${py} Q ${150 - len / 2} ${py + 10} ${150 - len} ${py + 25}`}
                    fill="none"
                    stroke="#6ea3d8"
                    strokeWidth={Math.max(1.5, normVal * 4)}
                    onMouseEnter={() => setHoveredRegion(`Lateral Root Branch #${i + 1}`)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className="cursor-pointer"
                  />
                  {/* Right Branch */}
                  <path
                    d={`M 150 ${py} Q ${150 + len / 2} ${py + 10} ${150 + len} ${py + 25}`}
                    fill="none"
                    stroke="#6ea3d8"
                    strokeWidth={Math.max(1.5, normVal * 4)}
                    onMouseEnter={() => setHoveredRegion(`Lateral Root Branch #${i + 1}`)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className="cursor-pointer"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* Render Symbiotic Mycorrhiza Perspective */}
        {viewType === 'MYCORRHIZA' && (
          <svg viewBox="0 0 300 240" className="w-full h-full">
            {/* Epidermal Axis */}
            <rect x="50" y="100" width="200" height="40" rx="4" fill="#1e293b" stroke="#3FB6A8" strokeWidth="2" />
            {/* Fungal Hyphae Arbuscules */}
            {[70, 110, 150, 190, 230].map((x, i) => (
              <g key={i} onMouseEnter={() => setHoveredRegion(`Arbuscular Mycorrhizal Hyphae Network #${i+1}`)} onMouseLeave={() => setHoveredRegion(null)} className="cursor-pointer">
                <circle cx={x} cy="70" r="12" fill="#a78bfa" opacity="0.6" />
                <line x1={x} y1="70" x2={x} y2="100" stroke="#c084fc" strokeWidth="2" />
              </g>
            ))}
            <text x="60" y="125" fill="#ffffff" fontSize="11" fontWeight="bold">Epidermal Cortical Axis</text>
          </svg>
        )}

        {/* Render Cellular Density Perspective */}
        {viewType === 'DENSITY' && (
          <svg viewBox="0 0 300 240" className="w-full h-full">
            <g>
              {[...Array(12)].map((_, i) => (
                <rect
                  key={i}
                  x={40 + (i % 4) * 55}
                  y={40 + Math.floor(i / 4) * 55}
                  width="48"
                  height="48"
                  rx="6"
                  fill={i % 2 === 0 ? '#3B6EA5' : '#3FB6A8'}
                  opacity={0.4 + normVal * 0.5}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredRegion(`Cellular Wall Matrix #${i+1} (Density: ${value} ${unit})`)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  className="cursor-pointer"
                />
              ))}
            </g>
          </svg>
        )}
      </div>

      {/* Dynamic Hover Tooltip / Coordinate Status Bar */}
      <div className="mt-3 bg-[#0f141b] dark:bg-[#0f141b] light:bg-[#ffffff] border border-[#232c39] light:border-[#e2e8f0] px-3 py-2 rounded-xl text-xs flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <Info className="w-4 h-4 text-[#3FB6A8] flex-shrink-0" />
          <span className="text-slate-300 dark:text-[#e6ebf2] light:text-[#0f172a] font-medium truncate">
            {hoveredRegion ? hoveredRegion : `Hover over vector coordinates to inspect anatomical regions`}
          </span>
        </div>
        <span className="text-[10px] font-bold text-[#6ea3d8] light:text-[#2563eb] flex-shrink-0 ml-2">
          {value != null ? `${value} ${unit || ''}` : 'N/A'}
        </span>
      </div>
    </div>
  );
}
