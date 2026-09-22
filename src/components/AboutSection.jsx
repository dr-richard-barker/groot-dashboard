import React from 'react';
import { BookOpen, ExternalLink, Code2, ShieldCheck, Database, Award } from 'lucide-react';

export default function AboutSection() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700/80 shadow-2xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-forest-600/30 border border-forest-500/40 flex items-center justify-center">
            <Database className="w-6 h-6 text-forest-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">About the GRooT Database</h1>
            <p className="text-sm text-slate-400">Global Root Traits Database</p>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          The <strong>Global Root Trait (GRooT) Database</strong> is a standardized, global database of plant root traits coverage across 38 continuous traits for over 6,000 species. GRooT combines data from multiple existing databases and literature to enable comparative plant functional trait research and global eco-system modeling.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Trait Records</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">114,222</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-semibold uppercase">Species Covered</p>
            <p className="text-2xl font-extrabold text-cyan-400 mt-1">6,213</p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400 font-semibold uppercase">Continuous Traits</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">38</p>
          </div>
        </div>
      </div>

      {/* R Code Extraction & Error Risk Calculation Section */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-xl space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-forest-400" />
          Data Extraction & Standardized R Methodology
        </h2>
        <p className="text-slate-300 text-xs leading-relaxed">
          This dashboard replicates and interactive visualizes the outputs computed by the reference script{' '}
          <code className="bg-slate-900 px-2 py-0.5 rounded text-emerald-300">GRooTExtraction.R</code>:
        </p>

        <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
          <li>
            <strong>Log Transformations</strong>: Skewed root traits (e.g. <em>Specific Root Length</em>, <em>Root Cortex Thickness</em>, <em>Root Lifespan</em>) are log2-transformed (<code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-300">log2(traitValue + 0.0001)</code>) prior to error risk standardization.
          </li>
          <li>
            <strong>Study Site Grouping</strong>: To avoid pseudo-replication, measurements are grouped by site (<code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-300">studySite</code>) before computing species-level mean, median, Q1 (25%), and Q3 (75%) quantiles.
          </li>
          <li>
            <strong>Error Risk Metric</strong>: Calculated as <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-300">errorRisk = (meanSpp - traitValue) / SDSppAvg</code> to flag anomalous entries.
          </li>
        </ul>
      </div>

      {/* Citation Box */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-xl space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Data Citation & Publication
        </h2>
        <p className="text-slate-300 text-xs">
          When using data from the GRooT database, please cite the original data paper:
        </p>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
          Guerrero-Ramírez, N. R., et al. (2021). "Global root traits (GRooT) database." <em>Global Ecology and Biogeography</em>, 30(1), 25-37.
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <a
            href="https://github.com/GRooT-Database/GRooT-Data"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-forest-400" />
            GitHub Repository (GRooT-Database/GRooT-Data)
          </a>

          <a
            href="https://groot-database.github.io/GRooT/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            Official GRooT Website
          </a>
        </div>
      </div>
    </div>
  );
}
