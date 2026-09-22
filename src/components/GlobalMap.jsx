import React, { useEffect, useRef, useState } from 'react';
import { Globe2, Filter, Layers, MapPin } from 'lucide-react';
import L from 'leaflet';

export default function GlobalMap({ geoPoints, metadata }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedBiome, setSelectedBiome] = useState('ALL');

  const biomesList = metadata?.biomes || [];

  const filteredGeoPoints = React.useMemo(() => {
    if (!geoPoints) return [];
    if (selectedBiome === 'ALL') return geoPoints;
    return geoPoints.filter(p => p.biome === selectedBiome);
  }, [geoPoints, selectedBiome]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 12,
        worldCopyJump: true
      });

      // Dark theme OpenStreetMap tiles (CartoDB Dark Matter)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    if (map._layerGroup) {
      map._layerGroup.clearLayers();
    } else {
      map._layerGroup = L.layerGroup().addTo(map);
    }

    // Add circle markers for filtered points
    filteredGeoPoints.forEach((pt) => {
      const radius = Math.min(Math.max(pt.count / 5, 4), 16);
      const marker = L.circleMarker([pt.lat, pt.lon], {
        radius: radius,
        fillColor: '#34d399',
        color: '#059669',
        weight: 1.5,
        opacity: 0.8,
        fillOpacity: 0.6
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 13px;">
          <strong style="color: #34d399; font-size: 14px;">${pt.loc || 'Sample Site'}</strong><br/>
          <span style="color: #cbd5e1;">Lat: ${pt.lat}, Lon: ${pt.lon}</span><br/>
          <span style="color: #94a3b8;">Species: <strong>${pt.speciesCount}</strong></span><br/>
          <span style="color: #94a3b8;">Observations: <strong>${pt.count}</strong></span><br/>
          ${pt.biome ? `<span style="display:inline-block; margin-top:4px; padding:2px 6px; background:#0f172a; border-radius:4px; color:#fbbf24; font-size:11px;">Biome: ${pt.biome}</span>` : ''}
        </div>
      `);

      map._layerGroup.addLayer(marker);
    });

  }, [filteredGeoPoints]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-forest-400" />
            Global Sample Site Distribution
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Geographic coordinates of study sites and sampling locations across global biomes.
          </p>
        </div>

        {/* Biome Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Biome:</span>
          <select
            value={selectedBiome}
            onChange={(e) => setSelectedBiome(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-forest-500 cursor-pointer"
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

      {/* Map Container */}
      <div className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60 shadow-2xl">
        <div ref={mapContainerRef} className="w-full h-[550px] rounded-xl overflow-hidden z-0" />
      </div>
    </div>
  );
}
