import React from 'react';
import { Sprout, BarChart3, GitCompare, Globe2, Download, Info, Database } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, metadata }) {
  const navItems = [
    { id: 'traits', label: 'Trait Explorer', icon: BarChart3 },
    { id: 'species', label: 'Species Comparator', icon: GitCompare },
    { id: 'map', label: 'Global Map', icon: Globe2 },
    { id: 'query', label: 'Data Query & Export', icon: Download },
    { id: 'about', label: 'About & Citation', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('traits')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-forest-900/40 ring-1 ring-forest-400/30">
              <Sprout className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">GRooT</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-forest-900/80 text-forest-300 border border-forest-700/50">
                  Database
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">Global Root Traits Explorer</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-forest-600/20 text-forest-300 border border-forest-500/40 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-forest-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Stats */}
          {metadata && (
            <div className="hidden lg:flex items-center space-x-3 text-xs bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg text-slate-300">
              <Database className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-white">{metadata.totalRecords.toLocaleString()}</span> records &bull;{' '}
                <span className="font-bold text-white">{metadata.totalSpecies.toLocaleString()}</span> species &bull;{' '}
                <span className="font-bold text-white">{metadata.totalTraits}</span> traits
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex border-t border-slate-800 bg-slate-900 px-2 py-1.5 justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-1.5 rounded-lg text-xs font-medium ${
                isActive ? 'text-forest-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
