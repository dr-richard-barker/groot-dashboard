# GRooT Database Exploration Dashboard & Interactive Vector Engine

[![Deploy to GitHub Pages](https://github.com/dr-richard-barker/groot-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/dr-richard-barker/groot-dashboard/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/GitHub_Pages-Live_Dashboard-3FB6A8?style=flat&logo=github)](https://dr-richard-barker.github.io/groot-dashboard/)
[![CoSE Theme](https://img.shields.io/badge/CoSE_Theme-v0.1-3B6EA5)](https://dr-richard-barker.github.io/groot-dashboard/)
[![License: MIT & CC-BY-4.0](https://img.shields.io/badge/License-MIT%20%2F%20CC--BY--4.0-emerald.svg)](LICENSE)

An interactive, high-performance web application and data pipeline for exploring, visualizing, and querying plant root functional traits from the **Global Root Traits (GRooT) Database** (`GRooT-Database/GRooT-Data`).

---

## 🌐 Live Web Application

- **Live GitHub Pages Dashboard**: [https://dr-richard-barker.github.io/groot-dashboard/](https://dr-richard-barker.github.io/groot-dashboard/)
- **GitHub Repository**: [dr-richard-barker/groot-dashboard](https://github.com/dr-richard-barker/groot-dashboard)

---

## 🧬 Key Features

### 1. Interactive Anatomical & Vector Root Diagrams (`RootDiagram.jsx`)
Inspired by the **`ggPlantmap`** open-source R anatomical mapping framework, the dashboard generates dynamic SVG vector diagrams for root traits:
- **Transversal Cross-Section View**: Illustrates Cortex thickness, Stele diameter, Endodermis, and Xylem conductive vessels. Coordinates and radii morph dynamically based on quantitative species values.
- **Root System Architecture (RSA) View**: Illustrates primary taproot length, lateral root branching density, root diameter, and rooting depth with scaled vector paths.
- **Membrane Transporters & Ion Uptake View**: Highlights plasma membrane ion channels & transporters:
  - **Nitrate/Ammonium Transporters (NRT1.1 / NRT2.1)** for Nitrogen ($N$).
  - **Phosphate Transporters (PHT1 family)** for Phosphorus ($P$).
  - **Calcium Channels (CNGCs / Annexins)** for Calcium ($Ca^{2+}$).
- **Symbiotic Mycorrhizal View**: Visualizes epidermal fungal hyphae networks and rhizobial nodule structures.
- **Cell Wall & Density View**: Visualizes cell wall lignification and dry matter density packing.

### 2. Trait Explorer & Distribution Metrics
- Explore all 38 continuous root traits with exact ecological unit annotations (e.g. $m\ g^{-1}$, $g\ cm^{-3}$, $mm$, $mg\ g^{-1}$, $days$).
- Quantile cards: Mean, Median, 25th percentile (Q1), 75th percentile (Q3), Minimum, Maximum, and Standard Deviation.
- Interactive Recharts distribution histograms (20-bin resolution) and top genera averages.
- **Coordinate Morphing Slider**: Allows users to dynamically morph vector anatomical dimensions across minimum to maximum observed bounds.

### 3. Species Search & Multi-Species Comparator
- Real-time search across **6,213 plant species**.
- Select up to 5 species for side-by-side comparative bar charts and vector diagram comparisons.

### 4. Global Sample Site Distribution Map
- Interactive Leaflet map visualizing sample site coordinates across global biomes (Arid, Boreal, Temperate, Tropical, Polar).

### 5. Data Query Builder & Export
- Multi-parameter filtering (by species, genus, family, trait name, and minimum value thresholds).
- Export custom datasets to **CSV** and **JSON** format.

### 6. CoSE Theme Engine & High-Contrast Light Mode
- Implements the **CoSE (NASA / AstroBotany estate)** theme design system (`#3B6EA5` CoSE Blue, `#3FB6A8` CoSE Teal).
- Dynamic Light/Dark Mode toggle.
- **Optimized High-Contrast Light Mode**: Pure crisp white background (`#ffffff`), dark slate text (`#0f172a`), and WCAG AAA compliant contrast for easy reading.
- Integrated visitor analytics beacon snippet (`visitor-analytics.astrobotany.workers.dev`).

---

## 🛠️ Data Pipeline & R Standardization

The python pre-processing pipeline (`data_pipeline/process_data.py`) downloads raw zips directly from the GRooT repository and replicates the statistical methodology of `GRooTExtraction.R`:
1. **Study Site Grouping**: Measurements grouped by site (`studySite`) to eliminate pseudo-replication.
2. **Quantile Calculation**: Species-level mean, median, Q1 (25%), and Q3 (75%) quantiles computed.
3. **Log Transformations**: Skewed traits transformed via `log2(traitValue + 0.0001)`.

---

## 📜 Citation & References

When using data from the GRooT database, please cite the original paper:
> Guerrero-Ramírez, N. R., et al. (2021). "Global root traits (GRooT) database." *Global Ecology and Biogeography*, 30(1), 25-37.

```bibtex
@article{guerrero2021global,
  title={Global root traits (GRooT) database},
  author={Guerrero-Ram{\'\i}rez, Nathaly R and Mommer, Liesje and others},
  journal={Global Ecology and Biogeography},
  volume={30},
  number={1},
  pages={25--37},
  year={2021}
}
```

---

## 🚀 Future Roadmap & Next Steps

1. **`ggPlantmap` R Package XML Export**: Support exporting traced SVG coordinates directly into `ggPlantmap` R tibble structures.
2. **Single-Cell RNA-seq Tissue Overlay**: Integrate cell-type transcriptomic heatmaps over root cross-section vector regions.
3. **WebGL 3D Root Architecture**: Render 3D root growth dynamics using Three.js / WebGL.
