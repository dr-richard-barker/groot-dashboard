import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, GitCompare, Sprout, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export default function SpeciesSearch({ speciesData, traitsSummary }) {
  const [query, setQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState([]);
  const [activeSpeciesDetail, setActiveSpeciesDetail] = useState(null);

  // Search matching species (limit to 30 for performance)
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
      if (selectedSpecies.length >= 5) return; // limit to 5 species comparison
      setSelectedSpecies([...selectedSpecies, sp]);
    }
  };

  // Prepare comparison data across key traits
  const comparisonData = useMemo(() => {
    if (selectedSpecies.length === 0) return [];
    
    // Select top 8 traits that exist across species
    const keyTraits = traitsSummary.slice(0, 8).map(t => t.traitName);
    
    return keyTraits.map(tName => {
      const readable = tName.replace('_', ' ');
      const row = { traitName: readable };
      selectedSpecies.forEach(sp => {
        const val = sp.traits[tName]?.mean;
        row[sp.fullName] = val != null ? val : 0;
      });
      return row;
    });
  }, [selectedSpecies, traitsSummary]);

  const COLORS = ['#34d399', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa'];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-forest-400" />
            Species Taxonomic Search & Comparator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
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
            className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-forest-500 shadow-inner"
          />
        </div>

        {/* Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-slate-900 border border-slate-700 rounded-xl max-h-64 overflow-y-auto divide-y divide-slate-800 shadow-2xl">
            {searchResults.map((sp) => {
              const isSelected = selectedSpecies.some(s => s.fullName === sp.fullName);
              return (
                <div
                  key={sp.fullName}
                  className="p-3 hover:bg-slate-800/80 flex items-center justify-between cursor-pointer transition-colors"
                  onClick={() => setActiveSpeciesDetail(sp)}
                >
                  <div>
                    <span className="font-bold text-emerald-300 italic">{sp.fullName}</span>
                    <span className="text-xs text-slate-400 ml-2">
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
                        : 'bg-forest-600/30 text-forest-300 border border-forest-500/40 hover:bg-forest-600/50'
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
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-forest-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-forest-400" />
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-900 text-xs font-semibold"
                style={{ borderColor: COLORS[idx % COLORS.length] }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="italic text-slate-200">{sp.fullName}</span>
                <button
                  onClick={() => toggleSpeciesForComparison(sp)}
                  className="text-slate-400 hover:text-rose-400 ml-1"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* Grouped Comparison Bar Chart */}
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="traitName" stroke="#94a3b8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                {selectedSpecies.map((sp, idx) => (
                  <Bar
                    key={sp.fullName}
                    dataKey={sp.fullName}
                    fill={COLORS[idx % COLORS.length]}
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
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700/80 shadow-2xl relative">
          <button
            onClick={() => setActiveSpeciesDetail(null)}
            className="absolute right-4 top-4 text-slate-400 hover:text-white text-lg font-bold"
          >
            &times;
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-forest-600/30 border border-forest-500/40 flex items-center justify-center flex-shrink-0">
              <Sprout className="w-6 h-6 text-forest-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold italic text-emerald-300">{activeSpeciesDetail.fullName}</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Family: <span className="text-slate-200">{activeSpeciesDetail.family || 'N/A'}</span> &bull; Genus:{' '}
                <span className="text-slate-200">{activeSpeciesDetail.genus}</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {activeSpeciesDetail.growthForm && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700 text-cyan-300">
                    Growth Form: {activeSpeciesDetail.growthForm}
                  </span>
                )}
                {activeSpeciesDetail.mycorrhizal && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700 text-amber-300">
                    Mycorrhizal: {activeSpeciesDetail.mycorrhizal}
                  </span>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-6 mb-3">Measured Root Traits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(activeSpeciesDetail.traits).map(([trait, info]) => (
              <div key={trait} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <p className="text-xs font-semibold text-slate-300 truncate">{trait.replace('_', ' ')}</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-extrabold text-emerald-400">{info.mean}</span>
                  <span className="text-[10px] text-slate-500">n = {info.n}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
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
