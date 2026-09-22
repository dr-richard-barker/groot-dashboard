import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Globe2, Filter, Layers, MapPin, ZoomIn, Info, CheckCircle2, ChevronRight, X } from 'lucide-react';
import L from 'leaflet';

export default function GlobalMap({ geoPoints, metadata, isDark }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [selectedBiome, setSelectedBiome] = useState('ALL');
  const [selectedSite, setSelectedSite] = useState(null);
  const [searchLocation, setSearchLocation] = useState('');

  const biomesList = metadata?.biomes || [];

  // Distinct color palette for biomes
  const biomeColors = {
    'Tropical': '#10b981',
    'Arid': '#f59e0b',
    'Temperate': '#3b82f6',
    'Continental': '#8b5cf6',
    'Polar': '#06b6d4',
    'Boreal': '#14b8a6',
    'Subtropical': '#ec4899',
    'Default': '#3FB6A8'
  };

  const getBiomeColor = (biomeName) => {
    if (!biomeName) return biomeColors.Default;
    for (const [key, color] of Object.entries(biomeColors)) {
      if (biomeName.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }
    return biomeColors.Default;
  };

  // Filter geo points by biome and search query
  const filteredGeoPoints = useMemo(() => {
    if (!geoPoints) return [];
    return geoPoints.filter((p) => {
      const matchesBiome = selectedBiome === 'ALL' || p.biome === selectedBiome;
      const matchesSearch = !searchLocation || (p.loc && p.loc.toLowerCase().includes(searchLocation.toLowerCase()));
      return matchesBiome && matchesSearch;
    });
  }, [geoPoints, selectedBiome, searchLocation]);

  // Initialize and clean up Leaflet Map safely across React component lifecycle
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map instance does not exist
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 14,
        worldCopyJump: true
      });

      // Layer group for circle markers
      const markerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markerGroup;

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Handle tile layer according to current theme (Light = Positron, Dark = Dark Matter)
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const attribution = isDark
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

    const tiles = L.tileLayer(tileUrl, {
      attribution: attribution,
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tiles;

    // CRITICAL: Call invalidateSize to fix gray/blank tiles when mounting in React tabs
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    // Cleanup on unmount to prevent "Map container is already initialized" crash
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, [isDark]);

  // Update Markers whenever filtered points change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    filteredGeoPoints.forEach((pt) => {
      const color = getBiomeColor(pt.biome);
      const radius = Math.min(Math.max(pt.count / 4, 4), 16);

      const marker = L.circleMarker([pt.lat, pt.lon], {
        radius: radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.7
      });

      // Click to select site
      marker.on('click', () => {
        setSelectedSite(pt);
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
          <strong style="color: ${color}; font-size: 14px;">${pt.loc || 'Study Site'}</strong><br/>
          <span style="color: #64748b;">Coordinates: <strong>${pt.lat}°N, ${pt.lon}°E</strong></span><br/>
          <span style="color: #64748b;">Unique Species: <strong>${pt.speciesCount}</strong></span><br/>
          <span style="color: #64748b;">Observation Records: <strong>${pt.count}</strong></span><br/>
          ${pt.biome ? `<span style="display:inline-block; margin-top:5px; padding:2px 6px; background:#0f172a; border-radius:4px; color:#ffffff; font-size:11px; font-weight:bold;">Biome: ${pt.biome}</span>` : ''}
        </div>
      `);

      layerGroup.addLayer(marker);
    });
  }, [filteredGeoPoints]);

  // Preset region zoom jump helper
  const jumpToRegion = (lat, lon, zoom) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#161d27] p-5 rounded-2xl border border-slate-200 dark:border-[#232c39] shadow-sm backdrop-blur-sm transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e6ebf2] flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-[#2563eb] dark:text-[#3FB6A8]" />
            Global Sample Site Distribution
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#9aa6b6] mt-1">
            Explore <strong>{filteredGeoPoints.length.toLocaleString()}</strong> study sites across global biomes with real coordinates from the GRooT dataset.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search location */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search site name / country..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="pl-3 pr-8 py-1.5 bg-slate-50 dark:bg-[#0f141b] border border-slate-300 dark:border-[#232c39] rounded-xl text-xs text-slate-900 dark:text-[#e6ebf2] placeholder-slate-400 focus:outline-none focus:border-[#2563eb] dark:focus:border-[#3FB6A8]"
            />
            {searchLocation && (
              <button onClick={() => setSearchLocation('')} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Biome Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedBiome}
              onChange={(e) => setSelectedBiome(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-[#0f141b] border border-slate-300 dark:border-[#232c39] rounded-xl text-xs font-semibold text-slate-900 dark:text-[#e6ebf2] focus:outline-none focus:border-[#2563eb] dark:focus:border-[#3FB6A8] cursor-pointer"
            >
              <option value="ALL">All Biomes ({geoPoints?.length || 0} sites)</option>
              {biomesList.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Jump Buttons & Biome Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#161d27] p-3 rounded-xl border border-slate-200 dark:border-[#232c39] shadow-sm text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="font-bold text-slate-700 dark:text-slate-300 mr-1">Quick Jump:</span>
          <button onClick={() => jumpToRegion(20, 0, 2)} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0f141b] hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-[#232c39]">Global</button>
          <button onClick={() => jumpToRegion(45, -100, 3.5)} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0f141b] hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-[#232c39]">N. America</button>
          <button onClick={() => jumpToRegion(-15, -60, 3.5)} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0f141b] hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-[#232c39]">S. America</button>
          <button onClick={() => jumpToRegion(50, 15, 4)} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0f141b] hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-[#232c39]">Europe</button>
          <button onClick={() => jumpToRegion(30, 105, 3.5)} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0f141b] hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-[#232c39]">Asia</button>
          <button onClick={() => jumpToRegion(0, 25, 3.5)} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0f141b] hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-[#232c39]">Africa</button>
        </div>

        {/* Biome Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 dark:text-[#9aa6b6]">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span> Tropical</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span> Arid</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span> Temperate</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span> Continental</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]"></span> Polar</span>
        </div>
      </div>

      {/* Main Map + Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Container */}
        <div className={`rounded-2xl border border-slate-200 dark:border-[#232c39] overflow-hidden shadow-lg p-3 bg-white dark:bg-[#161d27] ${selectedSite ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <div ref={mapContainerRef} className="w-full h-[550px] rounded-xl overflow-hidden z-0" />
        </div>

        {/* Selected Site Detail Inspector Panel */}
        {selectedSite && (
          <div className="bg-white dark:bg-[#161d27] p-5 rounded-2xl border border-slate-200 dark:border-[#232c39] shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#232c39]">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9aa6b6] flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-[#2563eb] dark:text-[#3FB6A8]" />
                  Study Site Inspector
                </span>
                <button
                  onClick={() => setSelectedSite(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 dark:text-[#e6ebf2] mt-3">
                {selectedSite.loc || 'Unnamed Research Site'}
              </h3>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#232c39]">
                  <span className="text-slate-500 dark:text-[#9aa6b6]">Latitude / Longitude</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedSite.lat}°, {selectedSite.lon}°</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#232c39]">
                  <span className="text-slate-500 dark:text-[#9aa6b6]">Koeppen Biome</span>
                  <span className="font-bold text-emerald-700 dark:text-[#34d399]">{selectedSite.biome || 'Not specified'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#232c39]">
                  <span className="text-slate-500 dark:text-[#9aa6b6]">Sample Species Count</span>
                  <span className="font-extrabold text-blue-700 dark:text-[#38bdf8]">{selectedSite.speciesCount} species</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-[#232c39]">
                  <span className="text-slate-500 dark:text-[#9aa6b6]">Observations Recorded</span>
                  <span className="font-extrabold text-amber-700 dark:text-[#fbbf24]">{selectedSite.count} entries</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-[#232c39]">
              <button
                onClick={() => jumpToRegion(selectedSite.lat, selectedSite.lon, 8)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 dark:bg-[#3B6EA5] dark:hover:bg-[#2d5683] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
                Zoom to Site (Level 8)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
