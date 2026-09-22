import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { Search, Filter, Info, ChevronRight, TrendingUp, Layers, Compass } from 'lucide-react';

export default function TraitExplorer({ traitsSummary, traitDistributions, speciesData }) {
  const [selectedTrait, setSelectedTrait] = useState(
    traitsSummary && traitsSummary.length > 0 ? traitsSummary[0].traitName : 'Specific_root_length'
  );
  const [searchFilter, setSearchFilter] = useState('');

  const currentSummary = useMemo(() => {
    return traitsSummary.find(t => t.traitName === selectedTrait) || traitsSummary[0];
  }, [traitsSummary, selectedTrait]);

  const currentDistribution = useMemo(() => {
    return traitDistributions[selectedTrait] || [];
  }, [traitDistributions, selectedTrait]);

  const topGeneraForTrait = useMemo(() => {
    if (!speciesData || !selectedTrait) return [];
    const genusMap = {};
    speciesData.forEach(sp => {
      const traitInfo = sp.traits[selectedTrait];
      if (traitInfo && traitInfo.mean != null) {
        if (!genusMap[sp.genus]) {
          genusMap[sp.genus] = { genus: sp.genus, total: 0, count: 0, values: [] };
        }
        genusMap[sp.genus].total += traitInfo.mean;
        genusMap[sp.genus].count += 1;
        genusMap[sp.genus].values.push(traitInfo.mean);
      }
    });

    return Object.values(genusMap)
      .map(g => ({
        genus: g.genus,
        mean: Number((g.total / g.count).toFixed(3)),
        speciesCount: g.count
      }))
      .sort((a, b) => b.mean - a.mean)
      .slice(0, 15);
  }, [speciesData, selectedTrait]);

  const filteredTraits = useMemo(() => {
    if (!searchFilter) return traitsSummary;
    return traitsSummary.filter(t =>
      t.traitName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.readableName.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [traitsSummary, searchFilter]);

  if (!currentSummary) return null;

  return (
    <div className="space-y-6">
      {/* Header & Trait Selection Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-forest-400" />
            Root Trait Explorer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyze distributions, quantiles, and genus-level averages across 38 standardized root traits.
          </p>
        </div>

        {/* Trait Selector Dropdown & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search trait..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-forest-500"
            />
          </div>

          <select
            value={selectedTrait}
            onChange={(e) => setSelectedTrait(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-forest-500 cursor-pointer max-w-[240px] truncate"
          >
            {filteredTraits.map((t) => (
              <option key={t.traitName} value={t.traitName}>
                {t.readableName} ({t.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Statistics Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Observations</p>
          <p className="text-xl font-extrabold text-white mt-1">{currentSummary.count.toLocaleString()}</p>
          <span className="text-[10px] text-forest-400 font-medium">Recorded values</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Mean</p>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">{currentSummary.mean}</p>
          <span className="text-[10px] text-slate-400 font-medium">Std Dev: {currentSummary.std}</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Median</p>
          <p className="text-xl font-extrabold text-cyan-400 mt-1">{currentSummary.median}</p>
          <span className="text-[10px] text-slate-400 font-medium">50th percentile</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">25th Percentile (Q1)</p>
          <p className="text-xl font-extrabold text-indigo-400 mt-1">{currentSummary.q25}</p>
          <span className="text-[10px] text-slate-400 font-medium">First quartile</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">75th Percentile (Q3)</p>
          <p className="text-xl font-extrabold text-amber-400 mt-1">{currentSummary.q75}</p>
          <span className="text-[10px] text-slate-400 font-medium">Third quartile</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Min Value</p>
          <p className="text-xl font-extrabold text-slate-300 mt-1">{currentSummary.min}</p>
          <span className="text-[10px] text-slate-400 font-medium">Minimum</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/50">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Max Value</p>
          <p className="text-xl font-extrabold text-slate-300 mt-1">{currentSummary.max}</p>
          <span className="text-[10px] text-slate-400 font-medium">Maximum</span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trait Value Frequency Histogram */}
        <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-forest-400" />
                Value Distribution Histogram
              </h2>
              <p className="text-xs text-slate-400">Frequency distribution across observed intervals (1st - 99th percentile range)</p>
            </div>
          </div>

          <div className="h-72 w-full mt-2">
            {currentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} angle={-30} textAnchor="end" interval={1} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
                    formatter={(value) => [`${value} samples`, 'Count']}
                    labelFormatter={(label) => `Interval: ${label}`}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {currentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#40976b' : '#34d399'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No histogram data available</div>
            )}
          </div>
        </div>

        {/* Top Genera Comparison Chart */}
        <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700/60 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                Top Genera Averages
              </h2>
              <p className="text-xs text-slate-400">Genera with highest species-level mean values for {currentSummary.readableName}</p>
            </div>
          </div>

          <div className="h-72 w-full mt-2">
            {topGeneraForTrait.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topGeneraForTrait} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="genus" type="category" stroke="#94a3b8" fontSize={11} tick={{ fill: '#cbd5e1' }} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
                    formatter={(val, name, item) => [
                      `${val} (Across ${item.payload.speciesCount} species)`,
                      'Mean Trait Value'
                    ]}
                  />
                  <Bar dataKey="mean" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No genus data for this trait</div>
            )}
          </div>
        </div>
      </div>

      {/* Trait Selection Grid List */}
      <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60">
        <h3 className="text-md font-bold text-white mb-3">All 38 GRooT Database Continuous Traits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {traitsSummary.map((t) => {
            const isSelected = t.traitName === selectedTrait;
            return (
              <button
                key={t.traitName}
                onClick={() => setSelectedTrait(t.traitName)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-forest-600/30 border-forest-400/80 text-white ring-1 ring-forest-500/50 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="truncate pr-2">
                  <p className="truncate font-bold">{t.readableName}</p>
                  <p className="text-[10px] text-slate-400 font-normal">{t.count.toLocaleString()} entries</p>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-forest-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
