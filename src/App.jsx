import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TraitExplorer from './components/TraitExplorer';
import SpeciesSearch from './components/SpeciesSearch';
import GlobalMap from './components/GlobalMap';
import DataQueryExport from './components/DataQueryExport';
import AboutSection from './components/AboutSection';
import { Sprout, Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('traits');
  
  // Read persisted theme preference or default to light mode if preferred
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('groot_theme');
    if (saved !== null) return saved === 'dark';
    return false; // Default to pure white light mode as requested!
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [traitsSummary, setTraitsSummary] = useState([]);
  const [traitDistributions, setTraitDistributions] = useState({});
  const [speciesData, setSpeciesData] = useState([]);
  const [geoPoints, setGeoPoints] = useState([]);
  const [metadata, setMetadata] = useState(null);

  // Sync dark class on html root element and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('groot_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('groot_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);
        const base = import.meta.env.BASE_URL || './';
        const cleanBase = base.endsWith('/') ? base : base + '/';

        const [tsRes, tdRes, spRes, geoRes, metaRes] = await Promise.all([
          fetch(`${cleanBase}data/traits_summary.json`),
          fetch(`${cleanBase}data/trait_distributions.json`),
          fetch(`${cleanBase}data/species_aggregated.json`),
          fetch(`${cleanBase}data/geo_points.json`),
          fetch(`${cleanBase}data/metadata.json`)
        ]);

        if (!tsRes.ok || !tdRes.ok || !spRes.ok || !geoRes.ok || !metaRes.ok) {
          throw new Error('Failed to load dataset files from public/data/');
        }

        const [ts, td, sp, geo, meta] = await Promise.all([
          tsRes.json(),
          tdRes.json(),
          spRes.json(),
          geoRes.json(),
          metaRes.json()
        ]);

        setTraitsSummary(ts);
        setTraitDistributions(td);
        setSpeciesData(sp);
        setGeoPoints(geo);
        setMetadata(meta);
        setLoading(false);
      } catch (err) {
        console.error('Error loading GRooT database assets:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f141b] text-slate-900 dark:text-[#e6ebf2] flex flex-col transition-colors">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metadata={metadata}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-[#3B6EA5]/20 border border-blue-200 dark:border-[#3B6EA5]/40 flex items-center justify-center animate-pulse">
              <Sprout className="w-8 h-8 text-[#0d9488] dark:text-[#3FB6A8] animate-bounce" />
            </div>
            <div className="flex items-center space-x-2 text-[#0d9488] dark:text-[#54c9ba] font-semibold text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Initializing GRooT Dataset (6,213 species, 38 traits with CoSE units)...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 p-6 rounded-2xl text-center space-y-2 max-w-lg mx-auto my-12">
            <h3 className="text-lg font-bold text-rose-700 dark:text-rose-300">Data Loading Error</h3>
            <p className="text-xs text-rose-600 dark:text-rose-200">{error}</p>
          </div>
        ) : (
          <>
            {activeTab === 'traits' && (
              <TraitExplorer
                traitsSummary={traitsSummary}
                traitDistributions={traitDistributions}
                speciesData={speciesData}
                isDark={isDark}
              />
            )}
            {activeTab === 'species' && (
              <SpeciesSearch
                speciesData={speciesData}
                traitsSummary={traitsSummary}
                isDark={isDark}
              />
            )}
            {activeTab === 'map' && (
              <GlobalMap
                geoPoints={geoPoints}
                metadata={metadata}
                isDark={isDark}
              />
            )}
            {activeTab === 'query' && (
              <DataQueryExport
                speciesData={speciesData}
                traitsSummary={traitsSummary}
                isDark={isDark}
              />
            )}
            {activeTab === 'about' && (
              <AboutSection
                isDark={isDark}
              />
            )}
          </>
        )}
      </main>

      {/* Footer with CoSE Branding */}
      <footer className="bg-white dark:bg-[#0f141b] border-t border-slate-200 dark:border-[#232c39] py-6 text-center text-xs text-slate-500 dark:text-[#9aa6b6] transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sprout className="w-4 h-4 text-[#0d9488] dark:text-[#3FB6A8]" />
            <span className="font-bold text-slate-800 dark:text-[#e6ebf2]">GRooT Database Explorer</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 dark:bg-[#3B6EA5]/20 text-[#2563eb] dark:text-[#6ea3d8] font-semibold border border-blue-200 dark:border-transparent">CoSE Theme</span>
          </div>
          <div>
            Data source:{' '}
            <a
              href="https://github.com/GRooT-Database/GRooT-Data"
              target="_blank"
              rel="noreferrer"
              className="text-[#0d9488] dark:text-[#54c9ba] hover:underline font-bold"
            >
              GRooT-Database/GRooT-Data
            </a>{' '}
            (Guerrero-Ramírez et al., 2021)
          </div>
        </div>
      </footer>
    </div>
  );
}
