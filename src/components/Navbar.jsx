import React, { useState, useEffect } from 'react';
import { Sprout, BarChart3, GitCompare, Globe2, Download, Info, Database, Sun, Moon } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, metadata, isDark, setIsDark }) {
  const navItems = [
    { id: 'traits', label: 'Trait Explorer', icon: BarChart3 },
    { id: 'species', label: 'Species Comparator', icon: GitCompare },
    { id: 'map', label: 'Global Map', icon: Globe2 },
    { id: 'query', label: 'Data Query & Export', icon: Download },
    { id: 'about', label: 'About & Citation', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 dark:bg-[#0f141b]/95 backdrop-blur-md border-b border-slate-800 dark:border-[#232c39] shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & CoSE Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('traits')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3B6EA5] to-[#3FB6A8] flex items-center justify-center shadow-lg ring-1 ring-white/20">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white dark:text-[#e6ebf2]">GRooT</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#3FB6A8]/20 text-[#3FB6A8] dark:text-[#54c9ba] border border-[#3FB6A8]/40 uppercase tracking-wider">
                  CoSE Theme
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-[#9aa6b6] font-medium hidden sm:block">Global Root Traits Explorer</p>
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
                      ? 'bg-[#3B6EA5]/20 text-[#6ea3d8] dark:text-[#54c9ba] border border-[#3B6EA5]/50 shadow-inner'
                      : 'text-slate-300 dark:text-[#9aa6b6] hover:text-white dark:hover:text-white hover:bg-slate-800/60 dark:hover:bg-[#161d27]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#3FB6A8] dark:text-[#54c9ba]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Quick Stats & Theme Toggle */}
          <div className="flex items-center space-x-3">
            {metadata && (
              <div className="hidden lg:flex items-center space-x-2 text-xs bg-slate-800/80 dark:bg-[#161d27] border border-slate-700/60 dark:border-[#232c39] px-3 py-1.5 rounded-lg text-slate-300 dark:text-[#9aa6b6]">
                <Database className="w-4 h-4 text-[#3FB6A8]" />
                <div>
                  <span className="font-bold text-white dark:text-[#e6ebf2]">{metadata.totalRecords.toLocaleString()}</span> records &bull;{' '}
                  <span className="font-bold text-white dark:text-[#e6ebf2]">{metadata.totalSpecies.toLocaleString()}</span> species
                </div>
              </div>
            )}

            {/* Dark / Light Theme Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl bg-slate-800 dark:bg-[#161d27] border border-slate-700 dark:border-[#232c39] text-slate-300 dark:text-[#9aa6b6] hover:text-white dark:hover:text-white transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#3B6EA5]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex border-t border-slate-800 dark:border-[#232c39] bg-slate-900 dark:bg-[#0f141b] px-2 py-1.5 justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-1.5 rounded-lg text-xs font-medium ${
                isActive ? 'text-[#3FB6A8] dark:text-[#54c9ba]' : 'text-slate-400'
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
