import csv
import json
import math
import os
import numpy as np

RAW_DIR = 'data_pipeline/raw'
PUBLIC_DATA_DIR = 'public/data'
os.makedirs(PUBLIC_DATA_DIR, exist_ok=True)

FULL_CSV = os.path.join(RAW_DIR, 'GRooTFullVersion.csv')
AGG_CSV = os.path.join(RAW_DIR, 'GRooTAggregateSpeciesVersion.csv')

def safe_float(val):
    try:
        if val is None or val == '' or val.lower() == 'na':
            return None
        v = float(val)
        return v if not math.isnan(v) and not math.isinf(v) else None
    except:
        return None

def process_data():
    print("Processing GRooT dataset...")
    
    # 1. Load Species Aggregated Data
    species_map = {} # key: (genus, species), value: dict
    trait_names = set()
    
    with open(AGG_CSV, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        for row in reader:
            genus = row['genusTNRS'].strip()
            species = row['speciesTNRS'].strip()
            trait = row['traitName'].strip()
            if not genus or not species or not trait:
                continue
            
            trait_names.add(trait)
            full_species = f"{genus} {species}"
            if full_species not in species_map:
                species_map[full_species] = {
                    'genus': genus,
                    'species': species,
                    'fullName': full_species,
                    'traits': {}
                }
            
            mean_val = safe_float(row['meanSpecies'])
            med_val = safe_float(row['medianSpecies'])
            q1_val = safe_float(row['firstQuantile'])
            q3_val = safe_float(row['thirdQuantile'])
            n_entries = int(row['entriesStudySite']) if row['entriesStudySite'].isdigit() else 1
            
            if mean_val is not None:
                species_map[full_species]['traits'][trait] = {
                    'mean': round(mean_val, 4),
                    'median': round(med_val, 4) if med_val is not None else round(mean_val, 4),
                    'q1': round(q1_val, 4) if q1_val is not None else round(mean_val, 4),
                    'q3': round(q3_val, 4) if q3_val is not None else round(mean_val, 4),
                    'n': n_entries
                }
    
    print(f"Loaded aggregated data for {len(species_map)} species across {len(trait_names)} traits.")

    # 2. Process Full Dataset for Metadata, Map Geo Points, and Trait Distributions
    trait_values = {t: [] for t in trait_names}
    geo_points = []
    genus_metadata = {}
    growth_forms = set()
    mycorrhizal_types = set()
    biomes = set()

    with open(FULL_CSV, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        for row in reader:
            genus = row.get('genusTNRS', '').strip()
            species = row.get('speciesTNRS', '').strip()
            full_species = f"{genus} {species}"
            
            gf = row.get('growthForm', '').strip()
            myc = row.get('mycorrhizalAssociationType', '').strip()
            biome = row.get('biomesKoeppenGroup', '').strip() or row.get('biomesKoeppen', '').strip()
            
            if gf: growth_forms.add(gf)
            if myc: mycorrhizal_types.add(myc)
            if biome: biomes.add(biome)
            
            if full_species in species_map:
                if gf and 'growthForm' not in species_map[full_species]:
                    species_map[full_species]['growthForm'] = gf
                if myc and 'mycorrhizal' not in species_map[full_species]:
                    species_map[full_species]['mycorrhizal'] = myc
                if row.get('familyTNRS') and 'family' not in species_map[full_species]:
                    species_map[full_species]['family'] = row['familyTNRS'].strip()

            trait = row.get('traitName', '').strip()
            val = safe_float(row.get('traitValue'))
            if trait in trait_values and val is not None:
                trait_values[trait].append(val)
                
            lat = safe_float(row.get('decimalLatitude'))
            lon = safe_float(row.get('decimalLongitud'))
            if lat is not None and lon is not None and -90 <= lat <= 90 and -180 <= lon <= 180:
                geo_points.append({
                    'lat': round(lat, 2),
                    'lon': round(lon, 2),
                    'loc': row.get('location', '').strip() or row.get('locationID', '').strip() or 'Unknown Site',
                    'sp': full_species if species else genus,
                    'trait': trait,
                    'biome': biome
                })

    # Cluster Geo Points slightly to reduce point cloud size for map
    geo_clusters = {}
    for pt in geo_points:
        key = (round(pt['lat'], 1), round(pt['lon'], 1))
        if key not in geo_clusters:
            geo_clusters[key] = {
                'lat': key[0],
                'lon': key[1],
                'loc': pt['loc'],
                'count': 0,
                'species': set(),
                'biome': pt['biome']
            }
        geo_clusters[key]['count'] += 1
        if pt['sp']:
            geo_clusters[key]['species'].add(pt['sp'])

    formatted_geo = [
        {
            'lat': c['lat'],
            'lon': c['lon'],
            'loc': c['loc'],
            'count': c['count'],
            'speciesCount': len(c['species']),
            'biome': c['biome']
        }
        for c in geo_clusters.values()
    ]

    # Compute Trait Distribution Histograms & Summaries
    traits_summary = []
    distribution_histograms = {}

    for t, vals in trait_values.items():
        if not vals:
            continue
        arr = np.array(vals)
        arr_clean = arr[np.isfinite(arr)]
        if len(arr_clean) == 0:
            continue
        
        q25 = float(np.percentile(arr_clean, 25))
        q50 = float(np.median(arr_clean))
        q75 = float(np.percentile(arr_clean, 75))
        min_v = float(np.min(arr_clean))
        max_v = float(np.max(arr_clean))
        mean_v = float(np.mean(arr_clean))
        std_v = float(np.std(arr_clean))
        
        # Histograms (log space if skewed, or 20 linear bins)
        # Using 5th to 95th percentile bounds for histogram visualization to exclude extreme outliers
        p5, p95 = np.percentile(arr_clean, [1, 99])
        filtered_vals = arr_clean[(arr_clean >= p5) & (arr_clean <= p95)]
        if len(filtered_vals) > 0:
            counts, bin_edges = np.histogram(filtered_vals, bins=20)
            bins = [
                {
                    'binStart': round(float(bin_edges[i]), 4),
                    'binEnd': round(float(bin_edges[i+1]), 4),
                    'label': f"{round(float(bin_edges[i]), 2)} - {round(float(bin_edges[i+1]), 2)}",
                    'count': int(counts[i])
                }
                for i in range(len(counts))
            ]
        else:
            bins = []

        distribution_histograms[t] = bins

        traits_summary.append({
            'traitName': t,
            'readableName': t.replace('_', ' '),
            'count': len(arr_clean),
            'min': round(min_v, 4),
            'max': round(max_v, 4),
            'mean': round(mean_v, 4),
            'median': round(q50, 4),
            'std': round(std_v, 4),
            'q25': round(q25, 4),
            'q75': round(q75, 4)
        })

    traits_summary.sort(key=lambda x: x['count'], reverse=True)

    # Save output JSON files
    with open(os.path.join(PUBLIC_DATA_DIR, 'traits_summary.json'), 'w') as f:
        json.dump(traits_summary, f, indent=2)

    with open(os.path.join(PUBLIC_DATA_DIR, 'trait_distributions.json'), 'w') as f:
        json.dump(distribution_histograms, f)

    species_list = list(species_map.values())
    with open(os.path.join(PUBLIC_DATA_DIR, 'species_aggregated.json'), 'w') as f:
        json.dump(species_list, f)

    with open(os.path.join(PUBLIC_DATA_DIR, 'geo_points.json'), 'w') as f:
        json.dump(formatted_geo, f)

    metadata = {
        'totalRecords': 114222,
        'totalSpecies': len(species_list),
        'totalTraits': len(traits_summary),
        'growthForms': sorted(list(growth_forms)),
        'mycorrhizalTypes': sorted(list(mycorrhizal_types)),
        'biomes': sorted(list(biomes))
    }
    with open(os.path.join(PUBLIC_DATA_DIR, 'metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)

    print("Data processing complete! Output saved to public/data.")

if __name__ == '__main__':
    process_data()
