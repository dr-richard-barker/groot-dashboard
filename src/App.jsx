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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [traitsSummary, setTraitsSummary] = useState([]);
  const [traitDistributions, setTraitDistributions] = useState({});
  const [speciesData, setSpeciesData] = useState([]);
  const [geoPoints, setGeoPoints] = useState([]);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    async function loadAllData() {
      try {
        setLoading(true);
        // Determine base URL path
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} metadata={metadata} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-forest-600/20 border border-forest-500/40 flex items-center justify-center animate-pulse">
              <Sprout className="w-8 h-8 text-forest-400 animate-bounce" />
            </div>
            <div className="flex items-center space-x-2 text-forest-400 font-semibold text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Initializing GRooT Dataset (6,213 species, 38 traits)...</span>
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

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sprout className="w-4 h-4 text-forest-400" />
            <span className="font-bold text-slate-300">GRooT Database Explorer</span>
            <span>&bull; Ready for GitHub Pages</span>
          </div>
          <div>
            Data source:{' '}
            <a
              href="https://github.com/GRooT-Database/GRooT-Data"
              target="_blank"
              rel="noreferrer"
              className="text-forest-400 hover:underline"
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
