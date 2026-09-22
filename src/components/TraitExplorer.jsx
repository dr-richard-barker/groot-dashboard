import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Label
} from 'recharts';
import { Search, Filter, Info, ChevronRight, TrendingUp, Layers, Compass, Tag } from 'lucide-react';

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
          genusMap[sp.genus] = { genus: sp.genus, total: 0, count: 0 };
        }
        genusMap[sp.genus].total += traitInfo.mean;
        genusMap[sp.genus].count += 1;
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

  const traitUnit = currentSummary.unit ? ` (${currentSummary.unit})` : '';

  return (
    <div className="space-y-6">
      {/* Header & Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 dark:bg-[#161d27] p-5 rounded-2xl border border-slate-700/60 dark:border-[#232c39] backdrop-blur-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white dark:text-[#e6ebf2] flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#3FB6A8] dark:text-[#54c9ba]" />
              Root Trait Explorer
            </h1>
            {currentSummary.unit && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#3B6EA5]/20 text-[#6ea3d8] dark:text-[#54c9ba] border border-[#3B6EA5]/40 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {currentSummary.unit}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 dark:text-[#9aa6b6] mt-1">
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
              className="w-full pl-9 pr-4 py-2 bg-slate-900 dark:bg-[#0f141b] border border-slate-700 dark:border-[#232c39] rounded-xl text-sm text-slate-200 dark:text-[#e6ebf2] placeholder-slate-500 focus:outline-none focus:border-[#3FB6A8]"
            />
          </div>

          <select
            value={selectedTrait}
            onChange={(e) => setSelectedTrait(e.target.value)}
            className="px-4 py-2 bg-slate-900 dark:bg-[#0f141b] border border-slate-700 dark:border-[#232c39] rounded-xl text-sm font-semibold text-white dark:text-[#e6ebf2] focus:outline-none focus:border-[#3FB6A8] cursor-pointer max-w-[240px] truncate"
          >
            {filteredTraits.map((t) => (
              <option key={t.traitName} value={t.traitName}>
                {t.readableName} ({t.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-slate-800/80 dark:bg-[#161d27] p-4 rounded-xl border border-slate-700/50 dark:border-[#232c39]">
          <p className="text-xs text-slate-400 dark:text-[#9aa6b6] font-semibold uppercase tracking-wider">Observations</p>
          <p className="text-xl font-extrabold text-white dark:text-[#e6ebf2] mt-1">{currentSummary.count.toLocaleString()}</p>
          <span className="text-[10px] text-[#3FB6A8] font-medium">Sample count (n)</span>
        </div>

        <div className="bg-slate-800/80 dark:bg-[#161d27] p-4 rounded-xl border border-slate-700/50 dark:border-[#232c39]">
          <p className="text-xs text-slate-400 dark:text-[#9aa6b6] font-semibold uppercase tracking-wider">Mean</p>
          <p className="text-xl font-extrabold text-[#54c9ba] mt-1">{currentSummary.mean} <span className="text-xs font-normal text-slate-400">{currentSummary.unit}</span></p>
          <span className="text-[10px] text-slate-400 dark:text-[#9aa6b6] font-medium">Std Dev: {currentSummary.std}</span>
        </div>

        <div className="bg-slate-800/80 dark:bg-[#161d27] p-4 rounded-xl border border-slate-700/50 dark:border-[#232c39]">
          <p className="text-xs text-slate-400 dark:text-[#9aa6b6] font-semibold uppercase tracking-wider">Median</p>
          <p className="text-xl font-extrabold text-[#6ea3d8] mt-1">{currentSummary.median} <span className="text-xs font-normal text-slate-400">{currentSummary.unit}</span></p>
          <span className="text-[10px] text-slate-400 dark:text-[#9aa6b6] font-medium">50th percentile</span>
        </div>

        <div className="bg-slate-800/80 dark:bg-[#161d27] p-4 rounded-xl border border-slate-700/50 dark:border-[#232c39]">
          <p className="text-xs text-slate-400 dark:text-[#9aa6b6] font-semibold uppercase tracking-wider">Q1 (25%)</p>
          <p className="text-xl font-extrabold text-indigo-400 mt-1">{currentSummary.q25} <span className="text-xs font-normal text-slate-400">{currentSummary.unit}</span></p>
          <span className="text-[10px] text-slate-400 dark:text-[#9aa6b6] font-medium">First quartile</span>
        </div>

        <div className="bg-slate-800/80 dark:bg-[#161d27] p-4 rounded-xl border border-slate-700/50 dark:border-[#232c39]">
          <p className="text-xs text-slate-400 dark:text-[#9aa6b6] font-semibold uppercase tracking-wider">Q3 (75%)</p>
          <p className="text-xl font-extrabold text-amber-400 mt-1">{currentSummary.q75} <span className="text-xs font-normal text-slate-400">{currentSummary.unit}</span></p>
          <span className="text-[10px] text-slate-400 dark:text-[#9aa6b6] font-medium">Third quartile</span>
        </div>

        <div className="bg-slate-800/80 dark:bg-[#161d27] p-4 rounded-xl border border-slate-700/50 dark:border-[#232c39]">
          <p className="text-xs text-slate-400 dark:text-[#9aa6b6] font-semibold uppercase tracking-wider">Min Value</p>
          <p className="text-xl font-extrabold text-slate-300 dark:text-[#e6ebf2] mt-1">{currentSummary.min}</p>
          <span className="text-[10px] text-slate-400 dark:text-[#9aa6b6] font-medium">Minimum</span>
        </div>

        <div className="bg-slate-800/80 dark:bg-[#161d27] p-4 rounded-xl border border-slate-700/50 dark:border-[#232c39]">
          <p className="text-xs text-slate-400 dark:text-[#9aa6b6] font-semibold uppercase tracking-wider">Max Value</p>
          <p className="text-xl font-extrabold text-slate-300 dark:text-[#e6ebf2] mt-1">{currentSummary.max}</p>
          <span className="text-[10px] text-slate-400 dark:text-[#9aa6b6] font-medium">Maximum</span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Value Distribution Histogram with Clear Axis Labels */}
        <div className="bg-slate-800/70 dark:bg-[#161d27] p-5 rounded-2xl border border-slate-700/60 dark:border-[#232c39] shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-white dark:text-[#e6ebf2] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#3FB6A8]" />
                {currentSummary.readableName} Distribution
              </h2>
              <p className="text-xs text-slate-400 dark:text-[#9aa6b6]">
                Frequency histogram across observed value intervals (1st - 99th percentile)
              </p>
            </div>
          </div>

          <div className="h-80 w-full mt-2">
            {currentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentDistribution} margin={{ top: 20, right: 20, left: 10, bottom: 45 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232c39" opacity={0.7} />
                  <XAxis dataKey="label" stroke="#9aa6b6" fontSize={10} angle={-30} textAnchor="end" interval={1}>
                    <Label
                      value={`Value Interval ${traitUnit}`}
                      position="bottom"
                      offset={30}
                      style={{ fill: '#6ea3d8', fontSize: 12, fontWeight: 700 }}
                    />
                  </XAxis>
                  <YAxis stroke="#9aa6b6" fontSize={11}>
                    <Label
                      value="Sample Count (n)"
                      angle={-90}
                      position="left"
                      offset={-5}
                      style={{ fill: '#6ea3d8', fontSize: 12, fontWeight: 700 }}
                    />
                  </YAxis>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f141b', borderColor: '#232c39', borderRadius: '0.5rem', color: '#e6ebf2' }}
                    formatter={(val) => [`${val} samples`, 'Count']}
                    labelFormatter={(label) => `Interval: ${label}`}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {currentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3B6EA5' : '#3FB6A8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No histogram data available</div>
            )}
          </div>
        </div>

        {/* Top Genera Comparison Chart with Clear Labels */}
        <div className="bg-slate-800/70 dark:bg-[#161d27] p-5 rounded-2xl border border-slate-700/60 dark:border-[#232c39] shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold text-white dark:text-[#e6ebf2] flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#6ea3d8]" />
                Top Genera Averages
              </h2>
              <p className="text-xs text-slate-400 dark:text-[#9aa6b6]">
                Genera with highest species-level mean values for {currentSummary.readableName}
              </p>
            </div>
          </div>

          <div className="h-80 w-full mt-2">
            {topGeneraForTrait.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topGeneraForTrait} layout="vertical" margin={{ top: 10, right: 30, left: 35, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232c39" opacity={0.7} />
                  <XAxis type="number" stroke="#9aa6b6" fontSize={11}>
                    <Label
                      value={`Species-Average Mean Trait Value ${traitUnit}`}
                      position="bottom"
                      offset={10}
                      style={{ fill: '#54c9ba', fontSize: 12, fontWeight: 700 }}
                    />
                  </XAxis>
                  <YAxis dataKey="genus" type="category" stroke="#9aa6b6" fontSize={11} tick={{ fill: '#e6ebf2' }} width={90}>
                    <Label
                      value="Plant Genus"
                      angle={-90}
                      position="left"
                      offset={-20}
                      style={{ fill: '#54c9ba', fontSize: 12, fontWeight: 700 }}
                    />
                  </YAxis>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f141b', borderColor: '#232c39', borderRadius: '0.5rem', color: '#e6ebf2' }}
                    formatter={(val, name, item) => [
                      `${val} ${currentSummary.unit} (Across ${item.payload.speciesCount} species)`,
                      'Mean Value'
                    ]}
                  />
                  <Bar dataKey="mean" fill="#3FB6A8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">No genus data for this trait</div>
            )}
          </div>
        </div>
      </div>

      {/* Trait Selection Grid List */}
      <div className="bg-slate-800/60 dark:bg-[#161d27] p-5 rounded-2xl border border-slate-700/60 dark:border-[#232c39]">
        <h3 className="text-md font-bold text-white dark:text-[#e6ebf2] mb-3">All 38 GRooT Database Continuous Traits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {traitsSummary.map((t) => {
            const isSelected = t.traitName === selectedTrait;
            return (
              <button
                key={t.traitName}
                onClick={() => setSelectedTrait(t.traitName)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#3B6EA5]/30 border-[#3B6EA5] text-white dark:text-[#e6ebf2] ring-1 ring-[#3B6EA5]/50 shadow-md'
                    : 'bg-slate-900/60 dark:bg-[#0f141b] border-slate-800 dark:border-[#232c39] text-slate-300 dark:text-[#9aa6b6] hover:bg-slate-800 dark:hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="truncate pr-2">
                  <p className="truncate font-bold">{t.readableName}</p>
                  <p className="text-[10px] text-slate-400 dark:text-[#9aa6b6] font-normal">
                    {t.count.toLocaleString()} entries {t.unit && `• ${t.unit}`}
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#3FB6A8]' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
