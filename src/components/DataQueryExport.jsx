import React, { useState, useMemo } from 'react';
import { Download, Search, Filter, FileSpreadsheet, FileCode, CheckCircle2, Tag } from 'lucide-react';
import Papa from 'papaparse';

export default function DataQueryExport({ speciesData, traitsSummary }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTraitFilter, setSelectedTraitFilter] = useState('ALL');
  const [minValFilter, setMinValFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const rows = useMemo(() => {
    if (!speciesData) return [];
    const result = [];
    speciesData.forEach(sp => {
      Object.entries(sp.traits).forEach(([trait, info]) => {
        result.push({
          genus: sp.genus,
          species: sp.species,
          fullName: sp.fullName,
          family: sp.family || '',
          growthForm: sp.growthForm || '',
          mycorrhizal: sp.mycorrhizal || '',
          traitName: trait,
          readableTrait: trait.replace('_', ' '),
          unit: info.unit || '',
          mean: info.mean,
          median: info.median,
          q1: info.q1,
          q3: info.q3,
          n: info.n
        });
      });
    });
    return result;
  }, [speciesData]);

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      if (selectedTraitFilter !== 'ALL' && row.traitName !== selectedTraitFilter) return false;
      if (minValFilter && row.mean < floatValue(minValFilter)) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          row.fullName.toLowerCase().includes(q) ||
          row.traitName.toLowerCase().includes(q) ||
          row.family.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [rows, selectedTraitFilter, minValFilter, searchTerm]);

  function floatValue(val) {
    const v = parseFloat(val);
    return isNaN(v) ? 0 : v;
  }

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page]);

  const exportToCSV = () => {
    const csvData = filteredRows.map(r => ({
      Genus: r.genus,
      Species: r.species,
      FullName: r.fullName,
      Family: r.family,
      GrowthForm: r.growthForm,
      Mycorrhizal: r.mycorrhizal,
      TraitName: r.traitName,
      Unit: r.unit,
      MeanSpecies: r.mean,
      MedianSpecies: r.median,
      FirstQuantile: r.q1,
      ThirdQuantile: r.q3,
      EntriesCount: r.n
    }));

    const csvStr = Papa.unparse(csvData);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GRooT_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const jsonStr = JSON.stringify(filteredRows, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GRooT_Export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 dark:bg-[#161d27] p-5 rounded-2xl border border-slate-700/60 dark:border-[#232c39] backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white dark:text-[#e6ebf2] flex items-center gap-2">
            <Download className="w-6 h-6 text-[#3FB6A8]" />
            Data Query Builder & Exporter
          </h1>
          <p className="text-sm text-slate-400 dark:text-[#9aa6b6] mt-1">
            Filter species root trait observations and export standardized datasets to CSV or JSON format.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#3FB6A8] hover:bg-[#34a89a] text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-[#3FB6A8]/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV ({filteredRows.length.toLocaleString()})
          </button>
          <button
            onClick={exportToJSON}
            className="flex items-center gap-2 px-4 py-2 bg-[#3B6EA5] hover:bg-[#2d5683] text-white font-bold rounded-xl text-xs transition-all"
          >
            <FileCode className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Query Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/80 dark:bg-[#161d27] p-4 rounded-2xl border border-slate-700/50 dark:border-[#232c39]">
        <div className="relative">
          <label className="text-xs font-semibold text-slate-400 dark:text-[#9aa6b6] block mb-1">Search Species / Family / Trait</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Pinus, Specific_root_length..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 dark:bg-[#0f141b] border border-slate-700 dark:border-[#232c39] rounded-xl text-xs text-white dark:text-[#e6ebf2] placeholder-slate-500 focus:outline-none focus:border-[#3FB6A8]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 dark:text-[#9aa6b6] block mb-1">Filter by Specific Trait</label>
          <select
            value={selectedTraitFilter}
            onChange={(e) => { setSelectedTraitFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 bg-slate-900 dark:bg-[#0f141b] border border-slate-700 dark:border-[#232c39] rounded-xl text-xs text-white dark:text-[#e6ebf2] focus:outline-none focus:border-[#3FB6A8]"
          >
            <option value="ALL">All Traits ({traitsSummary.length})</option>
            {traitsSummary.map(t => (
              <option key={t.traitName} value={t.traitName}>
                {t.readableName} {t.unit && `(${t.unit})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 dark:text-[#9aa6b6] block mb-1">Min Mean Trait Value</label>
          <input
            type="number"
            placeholder="Min mean threshold..."
            value={minValFilter}
            onChange={(e) => { setMinValFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 bg-slate-900 dark:bg-[#0f141b] border border-slate-700 dark:border-[#232c39] rounded-xl text-xs text-white dark:text-[#e6ebf2] placeholder-slate-500 focus:outline-none focus:border-[#3FB6A8]"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-800/70 dark:bg-[#161d27] rounded-2xl border border-slate-700/60 dark:border-[#232c39] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 dark:text-[#e6ebf2]">
            <thead className="bg-slate-900 dark:bg-[#0f141b] text-slate-400 dark:text-[#9aa6b6] font-bold uppercase tracking-wider border-b border-slate-700/80 dark:border-[#232c39]">
              <tr>
                <th className="px-4 py-3">Species</th>
                <th className="px-4 py-3">Family</th>
                <th className="px-4 py-3">Trait Name</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3 text-right">Mean</th>
                <th className="px-4 py-3 text-right">Median</th>
                <th className="px-4 py-3 text-right">Q1 (25%)</th>
                <th className="px-4 py-3 text-right">Q3 (75%)</th>
                <th className="px-4 py-3 text-center">n</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 dark:divide-[#232c39]">
              {pageRows.map((row, idx) => (
                <tr key={`${row.fullName}-${row.traitName}-${idx}`} className="hover:bg-slate-800/80 dark:hover:bg-[#1a2230] transition-colors">
                  <td className="px-4 py-2.5 font-bold italic text-[#54c9ba]">{row.fullName}</td>
                  <td className="px-4 py-2.5 text-slate-400 dark:text-[#9aa6b6]">{row.family || '-'}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-200 dark:text-[#e6ebf2]">{row.readableTrait}</td>
                  <td className="px-4 py-2.5 text-xs text-[#6ea3d8] font-semibold">{row.unit || '-'}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-white dark:text-[#e6ebf2]">{row.mean}</td>
                  <td className="px-4 py-2.5 text-right text-slate-300 dark:text-[#e6ebf2]">{row.median}</td>
                  <td className="px-4 py-2.5 text-right text-slate-400 dark:text-[#9aa6b6]">{row.q1}</td>
                  <td className="px-4 py-2.5 text-right text-slate-400 dark:text-[#9aa6b6]">{row.q3}</td>
                  <td className="px-4 py-2.5 text-center text-slate-400 dark:text-[#9aa6b6]">{row.n}</td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500 font-medium">
                    No trait observations matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-900 dark:bg-[#0f141b] p-4 flex items-center justify-between border-t border-slate-800 dark:border-[#232c39] text-xs text-slate-400 dark:text-[#9aa6b6]">
          <div>
            Showing <strong className="text-white dark:text-[#e6ebf2]">{((page - 1) * pageSize) + 1}</strong> to{' '}
            <strong className="text-white dark:text-[#e6ebf2]">{Math.min(page * pageSize, filteredRows.length)}</strong> of{' '}
            <strong className="text-white dark:text-[#e6ebf2]">{filteredRows.length.toLocaleString()}</strong> rows
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-slate-800 dark:bg-[#161d27] border border-slate-700 dark:border-[#232c39] rounded-lg text-slate-300 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-semibold text-slate-200 dark:text-[#e6ebf2]">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-slate-800 dark:bg-[#161d27] border border-slate-700 dark:border-[#232c39] rounded-lg text-slate-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
