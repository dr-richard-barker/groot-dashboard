import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Label
} from 'recharts';
import { Search, Filter, Info, ChevronRight, TrendingUp, Layers, Compass, Tag, Sliders } from 'lucide-react';
import RootDiagram from './RootDiagram';

export default function TraitExplorer({ traitsSummary, traitDistributions, speciesData, isDark }) {
  const [selectedTrait, setSelectedTrait] = useState(
    traitsSummary && traitsSummary.length > 0 ? traitsSummary[0].traitName : 'Specific_root_length'
  );
  const [searchFilter, setSearchFilter] = useState('');
  const [simulatedValue, setSimulatedValue] = useState(null);

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
  const activeVal = simulatedValue !== null ? simulatedValue : currentSummary.mean;

  return (
    <div className="space-y-6">
      {/* Header & Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#161d27] p-5 rounded-2xl border border-slate-200 dark:border-[#232c39] shadow-sm backdrop-blur-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e6ebf2] flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#2563eb] dark:text-[#3FB6A8]" />
              Root Trait Explorer
            </h1>
            {currentSummary.unit && (
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 dark:bg-[#3B6EA5]/20 text-[#2563eb] dark:text-[#6ea3d8] border border-blue-200 dark:border-[#3B6EA5]/40 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {currentSummary.unit}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-[#9aa6b6] mt-1">
            Analyze distributions, quantiles, and interactive vector root models across 38 standardized root traits.
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
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#0f141b] border border-slate-300 dark:border-[#232c39] rounded-xl text-sm text-slate-900 dark:text-[#e6ebf2] placeholder-slate-400 focus:outline-none focus:border-[#2563eb] dark:focus:border-[#3FB6A8]"
            />
          </div>

          <select
            value={selectedTrait}
            onChange={(e) => { setSelectedTrait(e.target.value); setSimulatedValue(null); }}
            className="px-4 py-2 bg-slate-50 dark:bg-[#0f141b] border border-slate-300 dark:border-[#232c39] rounded-xl text-sm font-semibold text-slate-900 dark:text-[#e6ebf2] focus:outline-none focus:border-[#2563eb] dark:focus:border-[#3FB6A8] cursor-pointer max-w-[240px] truncate"
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
        <div className="bg-white dark:bg-[#161d27] p-4 rounded-xl border border-slate-200 dark:border-[#232c39] shadow-sm">
          <p className="text-xs text-slate-500 dark:text-[#9aa6b6] font-semibold uppercase tracking-wider">Observations</p>
          <p className="text-xl font-extrabold text-slate-900 dark:text-[#e6ebf2] mt-1">{currentSummary.count.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 dark:text-[#3FB6A8] font-bold">Sample count (n)</span>
        </div>

        <div className="bg-white dark:bg-[#161d27] p-4 rounded-xl border border-slate-200 dark:border-[#232c39] shadow-sm">
          <p className="text-xs text-slate-500 dark:text-[#9aa6b6] font-semibold uppercase tracking-wider">Mean</p>
          <p className="text-xl font-extrabold text-emerald-700 dark:text-[#54c9ba] mt-1">{currentSummary.mean} <span className="text-xs font-normal text-slate-500">{currentSummary.unit}</span></p>
          <span className="text-[10px] text-slate-500 dark:text-[#9aa6b6] font-medium">Std: {currentSummary.std}</span>
        </div>

        <div className="bg-white dark:bg-[#161d27] p-4 rounded-xl border border-slate-200 dark:border-[#232c39] shadow-sm">
          <p className="text-xs text-slate-500 dark:text-[#9aa6b6] font-semibold uppercase tracking-wider">Median</p>
          <p className="text-xl font-extrabold text-blue-700 dark:text-[#6ea3d8] mt-1">{currentSummary.median} <span className="text-xs font-normal text-slate-500">{currentSummary.unit}</span></p>
          <span className="text-[10px] text-slate-500 dark:text-[#9aa6b6] font-medium">50th percentile</span>
        </div>

        <div className="bg-white dark:bg-[#161d27] p-4 rounded-xl border border-slate-200 dark:border-[#232c39] shadow-sm">
          <p className="text-xs text-slate-500 dark:text-[#9aa6b6] font-semibold uppercase tracking-wider">Q1 (25%)</p>
          <p className="text-xl font-extrabold text-indigo-700 dark:text-indigo-400 mt-1">{currentSummary.q25} <span className="text-xs font-normal text-slate-500">{currentSummary.unit}</span></p>
          <span className="text-[10px] text-slate-500 dark:text-[#9aa6b6] font-medium">First quartile</span>
        </div>

        <div className="bg-white dark:bg-[#161d27] p-4 rounded-xl border border-slate-200 dark:border-[#232c39] shadow-sm">
          <p className="text-xs text-slate-500 dark:text-[#9aa6b6] font-semibold uppercase tracking-wider">Q3 (75%)</p>
          <p className="text-xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">{currentSummary.q75} <span className="text-xs font-normal text-slate-500">{currentSummary.unit}</span></p>
          <span className="text-[10px] text-slate-500 dark:text-[#9aa6b6] font-medium">Third quartile</span>
        </div>

        <div className="bg-white dark:bg-[#161d27] p-4 rounded-xl border border-slate-200 dark:border-[#232c39] shadow-sm">
          <p className="text-xs text-slate-500 dark:text-[#9aa6b6] font-semibold uppercase tracking-wider">Min Value</p>
          <p className="text-xl font-extrabold text-slate-800 dark:text-[#e6ebf2] mt-1">{currentSummary.min}</p>
          <span className="text-[10px] text-slate-500 dark:text-[#9aa6b6] font-medium">Minimum</span>
        </div>

        <div className="bg-white dark:bg-[#161d27] p-4 rounded-xl border border-slate-200 dark:border-[#232c39] shadow-sm">
          <p className="text-xs text-slate-500 dark:text-[#9aa6b6] font-semibold uppercase tracking-wider">Max Value</p>
          <p className="text-xl font-extrabold text-slate-800 dark:text-[#e6ebf2] mt-1">{currentSummary.max}</p>
          <span className="text-[10px] text-slate-500 dark:text-[#9aa6b6] font-medium">Maximum</span>
        </div>
      </div>

      {/* Interactive Root Vector Model Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vector SVG Model */}
        <div className="lg:col-span-1">
          <RootDiagram
            traitName={selectedTrait}
            value={activeVal}
            unit={currentSummary.unit}
            minVal={currentSummary.min}
            maxVal={currentSummary.max}
            q25={currentSummary.q25}
            median={currentSummary.median}
            q75={currentSummary.q75}
            isDark={isDark}
          />
          {/* Interactive Trait Morphing Slider */}
          <div className="mt-3 bg-white dark:bg-[#161d27] p-3 rounded-xl border border-slate-200 dark:border-[#232c39] shadow-sm">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-800 dark:text-[#e6ebf2] flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-[#2563eb] dark:text-[#3FB6A8]" />
                Morph Vector Coordinates
              </span>
              <span className="font-mono text-blue-700 dark:text-[#6ea3d8] font-semibold">
                {activeVal} {currentSummary.unit}
              </span>
            </div>
            <input
              type="range"
              min={currentSummary.min}
              max={currentSummary.max}
              step={(currentSummary.max - currentSummary.min) / 100 || 0.01}
              value={activeVal}
              onChange={(e) => setSimulatedValue(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-[#0f141b] rounded-lg appearance-none cursor-pointer accent-[#2563eb] dark:accent-[#3FB6A8]"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Min: {currentSummary.min}</span>
              <button
                onClick={() => setSimulatedValue(null)}
                className="text-blue-600 dark:text-[#3FB6A8] hover:underline font-bold"
              >
                Reset to Mean
              </button>
              <span>Max: {currentSummary.max}</span>
            </div>
          </div>
        </div>

        {/* Value Distribution Histogram & Top Genera Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#161d27] p-5 rounded-2xl border border-slate-200 dark:border-[#232c39] shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-[#e6ebf2] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#2563eb] dark:text-[#3FB6A8]" />
                  {currentSummary.readableName} Distribution
                </h2>
                <p className="text-xs text-slate-500 dark:text-[#9aa6b6]">
                  Frequency histogram across observed value intervals (1st - 99th percentile)
                </p>
              </div>
            </div>

            <div className="h-64 w-full mt-2">
              {currentDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentDistribution} margin={{ top: 20, right: 20, left: 10, bottom: 45 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#232c39' : '#e2e8f0'} opacity={0.8} />
                    <XAxis dataKey="label" stroke={isDark ? '#9aa6b6' : '#475569'} fontSize={10} angle={-30} textAnchor="end" interval={1}>
                      <Label
                        value={`Value Interval ${traitUnit}`}
                        position="bottom"
                        offset={30}
                        style={{ fill: isDark ? '#6ea3d8' : '#2563eb', fontSize: 12, fontWeight: 700 }}
                      />
                    </XAxis>
                    <YAxis stroke={isDark ? '#9aa6b6' : '#475569'} fontSize={11}>
                      <Label
                        value="Sample Count (n)"
                        angle={-90}
                        position="left"
                        offset={-5}
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
                      formatter={(val) => [`${val} samples`, 'Count']}
                      labelFormatter={(label) => `Interval: ${label}`}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {currentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? (isDark ? '#3B6EA5' : '#2563eb') : (isDark ? '#3FB6A8' : '#0d9488')} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">No histogram data available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trait Selection Grid List */}
      <div className="bg-white dark:bg-[#161d27] p-5 rounded-2xl border border-slate-200 dark:border-[#232c39] shadow-sm">
        <h3 className="text-md font-bold text-slate-900 dark:text-[#e6ebf2] mb-3">All 38 GRooT Database Continuous Traits</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {traitsSummary.map((t) => {
            const isSelected = t.traitName === selectedTrait;
            return (
              <button
                key={t.traitName}
                onClick={() => { setSelectedTrait(t.traitName); setSimulatedValue(null); }}
                className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-[#3B6EA5]/30 border-blue-400 dark:border-[#3B6EA5] text-blue-900 dark:text-[#e6ebf2] ring-1 ring-blue-300 dark:ring-[#3B6EA5]/50 shadow-sm'
                    : 'bg-slate-50 dark:bg-[#0f141b] border-slate-200 dark:border-[#232c39] text-slate-700 dark:text-[#9aa6b6] hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <div className="truncate pr-2">
                  <p className="truncate font-bold">{t.readableName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-[#9aa6b6] font-normal">
                    {t.count.toLocaleString()} entries {t.unit && `• ${t.unit}`}
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-600 dark:text-[#3FB6A8]' : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
