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
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [traitsSummary, setTraitsSummary] = useState([]);
  const [traitDistributions, setTraitDistributions] = useState({});
  const [speciesData, setSpeciesData] = useState([]);
  const [geoPoints, setGeoPoints] = useState([]);
  const [metadata, setMetadata] = useState(null);

  // Sync dark class on html root element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
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
    <div className="min-h-screen bg-[#0f141b] text-[#e6ebf2] flex flex-col transition-colors">
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
            <div className="w-16 h-16 rounded-2xl bg-[#3B6EA5]/20 border border-[#3B6EA5]/40 flex items-center justify-center animate-pulse">
              <Sprout className="w-8 h-8 text-[#3FB6A8] animate-bounce" />
            </div>
            <div className="flex items-center space-x-2 text-[#54c9ba] font-semibold text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Initializing GRooT Dataset (6,213 species, 38 traits with CoSE units)...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-rose-950/50 border border-rose-800 p-6 rounded-2xl text-center space-y-2 max-w-lg mx-auto my-12">
            <h3 className="text-lg font-bold text-rose-300">Data Loading Error</h3>
            <p className="text-xs text-rose-200">{error}</p>
          </div>
        ) : (
          <>
            {activeTab === 'traits' && (
              <TraitExplorer
                traitsSummary={traitsSummary}
                traitDistributions={traitDistributions}
                speciesData={speciesData}
              />
            )}
            {activeTab === 'species' && (
              <SpeciesSearch speciesData={speciesData} traitsSummary={traitsSummary} />
            )}
            {activeTab === 'map' && <GlobalMap geoPoints={geoPoints} metadata={metadata} />}
            {activeTab === 'query' && (
              <DataQueryExport speciesData={speciesData} traitsSummary={traitsSummary} />
            )}
            {activeTab === 'about' && <AboutSection />}
          </>
        )}
      </main>

      {/* Footer with CoSE Branding & Analytics */}
      <footer className="bg-slate-900 dark:bg-[#0f141b] border-t border-slate-800 dark:border-[#232c39] py-6 text-center text-xs text-slate-400 dark:text-[#9aa6b6]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sprout className="w-4 h-4 text-[#3FB6A8]" />
            <span className="font-bold text-slate-200 dark:text-[#e6ebf2]">GRooT Database Explorer</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#3B6EA5]/20 text-[#6ea3d8]">CoSE Theme</span>
          </div>
          <div>
            Data source:{' '}
            <a
              href="https://github.com/GRooT-Database/GRooT-Data"
              target="_blank"
              rel="noreferrer"
              className="text-[#54c9ba] hover:underline font-semibold"
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
