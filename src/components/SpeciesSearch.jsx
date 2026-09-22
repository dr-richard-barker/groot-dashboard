import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, GitCompare, Sprout, ChevronRight, Tag, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Label } from 'recharts';
import RootDiagram from './RootDiagram';

export default function SpeciesSearch({ speciesData, traitsSummary, isDark }) {
  const [query, setQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState([]);
  const [activeSpeciesDetail, setActiveSpeciesDetail] = useState(null);
  const [activeCompareTrait, setActiveCompareTrait] = useState('Specific_root_length');

  const searchResults = useMemo(() => {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    return speciesData
      .filter(s => s.fullName.toLowerCase().includes(q) || s.genus.toLowerCase().includes(q) || (s.family && s.family.toLowerCase().includes(q)))
      .slice(0, 25);
  }, [speciesData, query]);

  const toggleSpeciesForComparison = (sp) => {
    if (selectedSpecies.some(s => s.fullName === sp.fullName)) {
      setSelectedSpecies(selectedSpecies.filter(s => s.fullName !== sp.fullName));
    } else {
      if (selectedSpecies.length >= 5) return;
      setSelectedSpecies([...selectedSpecies, sp]);
    }
  };

  const currentTraitSummary = useMemo(() => {
    return traitsSummary.find(t => t.traitName === activeCompareTrait) || traitsSummary[0];
  }, [traitsSummary, activeCompareTrait]);

  const comparisonData = useMemo(() => {
    if (selectedSpecies.length === 0) return [];
    
    const keyTraits = traitsSummary.slice(0, 8);
    
    return keyTraits.map(tObj => {
      const tName = tObj.traitName;
      const readable = `${tObj.readableName}${tObj.unit ? ` (${tObj.unit})` : ''}`;
      const row = { traitName: readable, unit: tObj.unit || '' };
      selectedSpecies.forEach(sp => {
        const val = sp.traits[tName]?.mean;
        row[sp.fullName] = val != null ? val : 0;
      });
      return row;
    });
  }, [selectedSpecies, traitsSummary]);

  const COSE_COLORS = isDark
    ? ['#3FB6A8', '#6ea3d8', '#f59e0b', '#a78bfa', '#f472b6']
    : ['#0d9488', '#2563eb', '#d97706', '#7c3aed', '#db2777'];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white dark:bg-[#161d27] p-6 rounded-2xl border border-slate-200 dark:border-[#232c39] shadow-sm backdrop-blur-sm transition-colors">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e6ebf2] flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-[#2563eb] dark:text-[#3FB6A8]" />
            Species Taxonomic Search & Comparator
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#9aa6b6] mt-1">
            Search across 6,213 species in the GRooT database. Add species to compare their mean root trait values and vector diagrams side by side.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="mt-4 relative max-w-xl">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Type species or genus name (e.g. Pinus, Quercus, Abies, Acer)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0f141b] border border-slate-300 dark:border-[#232c39] rounded-xl text-slate-900 dark:text-[#e6ebf2] placeholder-slate-400 focus:outline-none focus:border-[#2563eb] dark:focus:border-[#3FB6A8] shadow-inner"
          />
        </div>

        {/* Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white dark:bg-[#0f141b] border border-slate-200 dark:border-[#232c39] rounded-xl max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-[#232c39] shadow-xl">
            {searchResults.map((sp) => {
              const isSelected = selectedSpecies.some(s => s.fullName === sp.fullName);
              return (
                <div
                  key={sp.fullName}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-[#161d27] flex items-center justify-between cursor-pointer transition-colors"
                  onClick={() => setActiveSpeciesDetail(sp)}
                >
                  <div>
                    <span className="font-bold text-emerald-700 dark:text-[#54c9ba] italic">{sp.fullName}</span>
                    <span className="text-xs text-slate-500 dark:text-[#9aa6b6] ml-2">
                      ({sp.family || sp.genus}) &bull; {Object.keys(sp.traits).length} traits measured
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSpeciesForComparison(sp);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700/50'
                        : 'bg-blue-50 dark:bg-[#3B6EA5]/30 text-blue-700 dark:text-[#6ea3d8] border border-blue-200 dark:border-[#3B6EA5]/50 hover:bg-blue-100'
                    }`}
                  >
                    {isSelected ? <Trash2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {isSelected ? 'Remove' : 'Compare'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison Section with Side-by-Side Root Diagrams */}
      {selectedSpecies.length > 0 && (
        <div className="bg-white dark:bg-[#161d27] p-5 rounded-2xl border border-slate-200 dark:border-[#3B6EA5]/40 shadow-xl space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#e6ebf2] flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-[#2563eb] dark:text-[#3FB6A8]" />
              Comparing ({selectedSpecies.length}/5 species)
            </h2>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Vector Trait:</span>
              <select
                value={activeCompareTrait}
                onChange={(e) => setActiveCompareTrait(e.target.value)}
                className="px-3 py-1 bg-slate-50 dark:bg-[#0f141b] border border-slate-300 dark:border-[#232c39] rounded-lg text-xs font-bold text-slate-900 dark:text-[#e6ebf2]"
              >
                {traitsSummary.map(t => (
                  <option key={t.traitName} value={t.traitName}>{t.readableName}</option>
                ))}
              </select>
              <button
                onClick={() => setSelectedSpecies([])}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 underline ml-2"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedSpecies.map((sp, idx) => (
              <div
                key={sp.fullName}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-50 dark:bg-[#0f141b] text-xs font-semibold shadow-sm"
                style={{ borderColor: COSE_COLORS[idx % COSE_COLORS.length] }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COSE_COLORS[idx % COSE_COLORS.length] }} />
                <span className="italic text-slate-800 dark:text-[#e6ebf2]">{sp.fullName}</span>
                <button
                  onClick={() => toggleSpeciesForComparison(sp)}
                  className="text-slate-400 hover:text-rose-600 ml-1"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* Side-by-Side SVG Diagrams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {selectedSpecies.map((sp) => {
              const traitVal = sp.traits[activeCompareTrait]?.mean;
              return (
                <div key={sp.fullName} className="bg-slate-50 dark:bg-[#0f141b] p-3 rounded-xl border border-slate-200 dark:border-[#232c39] shadow-sm">
                  <div className="text-center mb-2">
                    <p className="font-bold italic text-sm text-emerald-700 dark:text-[#54c9ba] truncate">{sp.fullName}</p>
                    <p className="text-[10px] text-slate-600 dark:text-[#9aa6b6]">
                      {currentTraitSummary?.readableName}: <strong className="text-slate-900 dark:text-[#e6ebf2]">{traitVal != null ? traitVal : 'N/A'} {currentTraitSummary?.unit}</strong>
                    </p>
                  </div>
                  <RootDiagram
                    traitName={activeCompareTrait}
                    value={traitVal}
                    unit={currentTraitSummary?.unit}
                    minVal={currentTraitSummary?.min}
                    maxVal={currentTraitSummary?.max}
                    q25={currentTraitSummary?.q25}
                    median={currentTraitSummary?.median}
                    q75={currentTraitSummary?.q75}
                    isDark={isDark}
                  />
                </div>
              );
            })}
          </div>

          {/* Grouped Comparison Bar Chart */}
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 20, left: 28, bottom: 52 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#232c39' : '#e2e8f0'} opacity={0.8} />
                <XAxis dataKey="traitName" stroke={isDark ? '#9aa6b6' : '#475569'} fontSize={10} interval={0} angle={-20} textAnchor="end">
                  <Label
                    value="Root Functional Traits"
                    position="bottom"
                    offset={35}
                    style={{ fill: isDark ? '#6ea3d8' : '#2563eb', fontSize: 12, fontWeight: 700 }}
                  />
                </XAxis>
                <YAxis stroke={isDark ? '#9aa6b6' : '#475569'} fontSize={11}>
                  <Label
                    value="Species Mean Trait Value"
                    angle={-90}
                    position="left"
                    offset={-10}
                    style={{ fill: isDark ? '#6ea3d8' : '#2563eb', fontSize: 12, fontWeight: 700 }}
                  />
                </YAxis>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f141b' : '#ffffff',
                    borderColor: isDark ? '#232c39' : '#cbd5e1',
                    borderRadius: '0.5rem',
                    color: isDark ? '#e6ebf2' : '#0f172a',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(val, name, item) => [`${val} ${item.payload.unit || ''}`, name]}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                {selectedSpecies.map((sp, idx) => (
                  <Bar
                    key={sp.fullName}
                    dataKey={sp.fullName}
                    fill={COSE_COLORS[idx % COSE_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Active Species Detail Modal / Card */}
      {activeSpeciesDetail && (
        <div className="bg-white dark:bg-[#161d27] p-6 rounded-2xl border border-slate-200 dark:border-[#232c39] shadow-2xl relative">
          <button
            onClick={() => setActiveSpeciesDetail(null)}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-white text-lg font-bold"
          >
            &times;
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-[#3B6EA5]/30 border border-blue-200 dark:border-[#3B6EA5]/50 flex items-center justify-center flex-shrink-0">
              <Sprout className="w-6 h-6 text-[#2563eb] dark:text-[#3FB6A8]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold italic text-emerald-700 dark:text-[#54c9ba]">{activeSpeciesDetail.fullName}</h2>
              <p className="text-sm text-slate-500 dark:text-[#9aa6b6] mt-0.5">
                Family: <span className="text-slate-800 dark:text-[#e6ebf2] font-semibold">{activeSpeciesDetail.family || 'N/A'}</span> &bull; Genus:{' '}
                <span className="text-slate-800 dark:text-[#e6ebf2] font-semibold">{activeSpeciesDetail.genus}</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {activeSpeciesDetail.growthForm && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-[#0f141b] border border-blue-200 dark:border-[#232c39] text-blue-700 dark:text-[#6ea3d8]">
                    Growth Form: {activeSpeciesDetail.growthForm}
                  </span>
                )}
                {activeSpeciesDetail.mycorrhizal && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-[#0f141b] border border-amber-200 dark:border-[#232c39] text-amber-700 dark:text-amber-300">
                    Mycorrhizal: {activeSpeciesDetail.mycorrhizal}
                  </span>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-[#e6ebf2] uppercase tracking-wider mt-6 mb-3">Measured Root Traits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(activeSpeciesDetail.traits).map(([trait, info]) => (
              <div key={trait} className="bg-slate-50 dark:bg-[#0f141b] p-3 rounded-xl border border-slate-200 dark:border-[#232c39]">
                <p className="text-xs font-semibold text-slate-700 dark:text-[#e6ebf2] truncate">{trait.replace('_', ' ')}</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-extrabold text-emerald-700 dark:text-[#54c9ba]">{info.mean} <span className="text-xs font-normal text-slate-500">{info.unit}</span></span>
                  <span className="text-[10px] text-slate-400">n = {info.n}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-[#9aa6b6] mt-1 flex justify-between">
                  <span>Q1: {info.q1}</span>
                  <span>Med: {info.median}</span>
                  <span>Q3: {info.q3}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
