import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, GitCompare, Sprout, ChevronRight, Tag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Label } from 'recharts';

export default function SpeciesSearch({ speciesData, traitsSummary }) {
  const [query, setQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState([]);
  const [activeSpeciesDetail, setActiveSpeciesDetail] = useState(null);

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

  const comparisonData = useMemo(() => {
    if (selectedSpecies.length === 0) return [];
    
    // Top traits to compare
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

  const COSE_COLORS = ['#3FB6A8', '#6ea3d8', '#f59e0b', '#a78bfa', '#f472b6'];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-slate-800/60 dark:bg-[#161d27] p-6 rounded-2xl border border-slate-700/60 dark:border-[#232c39] backdrop-blur-sm">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-white dark:text-[#e6ebf2] flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-[#3FB6A8]" />
            Species Taxonomic Search & Comparator
          </h1>
          <p className="text-sm text-slate-400 dark:text-[#9aa6b6] mt-1">
            Search across 6,213 species in the GRooT database. Add species to compare their mean root trait values side by side.
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
            className="w-full pl-11 pr-4 py-3 bg-slate-900 dark:bg-[#0f141b] border border-slate-700 dark:border-[#232c39] rounded-xl text-white dark:text-[#e6ebf2] placeholder-slate-500 focus:outline-none focus:border-[#3FB6A8] shadow-inner"
          />
        </div>

        {/* Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-slate-900 dark:bg-[#0f141b] border border-slate-700 dark:border-[#232c39] rounded-xl max-h-64 overflow-y-auto divide-y divide-slate-800 dark:divide-[#232c39] shadow-2xl">
            {searchResults.map((sp) => {
              const isSelected = selectedSpecies.some(s => s.fullName === sp.fullName);
              return (
                <div
                  key={sp.fullName}
                  className="p-3 hover:bg-slate-800/80 dark:hover:bg-[#161d27] flex items-center justify-between cursor-pointer transition-colors"
                  onClick={() => setActiveSpeciesDetail(sp)}
                >
                  <div>
                    <span className="font-bold text-[#54c9ba] italic">{sp.fullName}</span>
                    <span className="text-xs text-slate-400 dark:text-[#9aa6b6] ml-2">
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
                        ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                        : 'bg-[#3B6EA5]/30 text-[#6ea3d8] border border-[#3B6EA5]/50 hover:bg-[#3B6EA5]/50'
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

      {/* Comparison Drawer / Selected Species Bar */}
      {selectedSpecies.length > 0 && (
        <div className="bg-slate-800/80 dark:bg-[#161d27] p-5 rounded-2xl border border-[#3B6EA5]/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white dark:text-[#e6ebf2] flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-[#3FB6A8]" />
              Comparing ({selectedSpecies.length}/5 species)
            </h2>
            <button
              onClick={() => setSelectedSpecies([])}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedSpecies.map((sp, idx) => (
              <div
                key={sp.fullName}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-900 dark:bg-[#0f141b] text-xs font-semibold"
                style={{ borderColor: COSE_COLORS[idx % COSE_COLORS.length] }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COSE_COLORS[idx % COSE_COLORS.length] }} />
                <span className="italic text-slate-200 dark:text-[#e6ebf2]">{sp.fullName}</span>
                <button
                  onClick={() => toggleSpeciesForComparison(sp)}
                  className="text-slate-400 hover:text-rose-400 ml-1"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* Grouped Comparison Bar Chart with Labels */}
          <div className="h-96 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 20, left: 15, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232c39" opacity={0.7} />
                <XAxis dataKey="traitName" stroke="#9aa6b6" fontSize={10} interval={0} angle={-20} textAnchor="end">
                  <Label
                    value="Root Functional Traits"
                    position="bottom"
                    offset={35}
                    style={{ fill: '#6ea3d8', fontSize: 12, fontWeight: 700 }}
                  />
                </XAxis>
                <YAxis stroke="#9aa6b6" fontSize={11}>
                  <Label
                    value="Species Mean Trait Value"
                    angle={-90}
                    position="left"
                    offset={0}
                    style={{ fill: '#6ea3d8', fontSize: 12, fontWeight: 700 }}
                  />
                </YAxis>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f141b', borderColor: '#232c39', borderRadius: '0.5rem', color: '#e6ebf2' }}
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
        <div className="bg-slate-800 dark:bg-[#161d27] p-6 rounded-2xl border border-slate-700/80 dark:border-[#232c39] shadow-2xl relative">
          <button
            onClick={() => setActiveSpeciesDetail(null)}
            className="absolute right-4 top-4 text-slate-400 hover:text-white text-lg font-bold"
          >
            &times;
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#3B6EA5]/30 border border-[#3B6EA5]/50 flex items-center justify-center flex-shrink-0">
              <Sprout className="w-6 h-6 text-[#3FB6A8]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold italic text-[#54c9ba]">{activeSpeciesDetail.fullName}</h2>
              <p className="text-sm text-slate-400 dark:text-[#9aa6b6] mt-0.5">
                Family: <span className="text-slate-200 dark:text-[#e6ebf2]">{activeSpeciesDetail.family || 'N/A'}</span> &bull; Genus:{' '}
                <span className="text-slate-200 dark:text-[#e6ebf2]">{activeSpeciesDetail.genus}</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {activeSpeciesDetail.growthForm && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 dark:bg-[#0f141b] border border-slate-700 dark:border-[#232c39] text-[#6ea3d8]">
                    Growth Form: {activeSpeciesDetail.growthForm}
                  </span>
                )}
                {activeSpeciesDetail.mycorrhizal && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 dark:bg-[#0f141b] border border-slate-700 dark:border-[#232c39] text-amber-300">
                    Mycorrhizal: {activeSpeciesDetail.mycorrhizal}
                  </span>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-sm font-bold text-white dark:text-[#e6ebf2] uppercase tracking-wider mt-6 mb-3">Measured Root Traits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(activeSpeciesDetail.traits).map(([trait, info]) => (
              <div key={trait} className="bg-slate-900/80 dark:bg-[#0f141b] p-3 rounded-xl border border-slate-800 dark:border-[#232c39]">
                <p className="text-xs font-semibold text-slate-300 dark:text-[#e6ebf2] truncate">{trait.replace('_', ' ')}</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-extrabold text-[#54c9ba]">{info.mean} <span className="text-xs font-normal text-slate-400">{info.unit}</span></span>
                  <span className="text-[10px] text-slate-500">n = {info.n}</span>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-[#9aa6b6] mt-1 flex justify-between">
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
