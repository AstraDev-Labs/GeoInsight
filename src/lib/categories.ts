// Comprehensive list of Remote Sensing & GIS research vectors
// Used across the platform for post categorization, filtering, and SEO

export const RESEARCH_VECTORS = [
    // Core Remote Sensing
    'Land Cover Change',
    'Land Use Land Cover (LULC)',
    'Satellite Image Processing',
    'Multispectral Analysis',
    'Hyperspectral Remote Sensing',
    'SAR (Synthetic Aperture Radar)',
    'LiDAR & Point Cloud',
    'Thermal Remote Sensing',
    'Optical Remote Sensing',
    'UAV / Drone Mapping',

    // Vegetation & Agriculture
    'Vegetation Index (NDVI/EVI)',
    'Agriculture & Crop Monitoring',
    'Precision Agriculture',
    'Forestry & Deforestation',
    'Soil Analysis',

    // Water & Climate
    'Hydrology & Watershed',
    'Flood Mapping & Monitoring',
    'Climate Analysis',
    'Oceanography & Coastal',
    'Snow & Glacier Monitoring',
    'Water Quality Assessment',

    // Urban & Infrastructure
    'Urban GIS & Planning',
    'Urban Heat Island',
    'Smart City Analytics',
    'Transportation GIS',
    'Infrastructure Mapping',
    'Building Footprint Extraction',

    // Environment & Hazards
    'Environmental Monitoring',
    'Air Quality & Pollution',
    'Disaster Risk Management',
    'Earthquake & Seismic Analysis',
    'Wildfire Detection & Mapping',
    'Landslide Susceptibility',
    'Erosion & Sedimentation',

    // Terrain & Geology
    'DEM & Terrain Analysis',
    'Geological Mapping',
    'Geomorphology',
    'Bathymetry',
    'Topographic Surveying',

    // Spatial Analysis & Modeling
    'Spatial Data Analysis',
    'Geostatistics',
    'Machine Learning in RS',
    'Deep Learning & AI',
    'Object Detection (OBIA)',
    'Change Detection',
    'Time Series Analysis',
    'Image Classification',

    // Data & Technology
    'Google Earth Engine',
    'Cloud Computing in GIS',
    'Web GIS & Mapping',
    'Geodatabase Management',
    'Open Source GIS (QGIS)',
    'ArcGIS Pro',
    'Photogrammetry',

    // Applications
    'Cadastral & Land Records',
    'Archaeological GIS',
    'Health GIS & Epidemiology',
    'Biodiversity & Ecology',
    'Marine & Fisheries GIS',
    'Mining & Resource Mapping',
    'Renewable Energy Siting',
    'Defense & Security GIS',

    // Planetary & Space
    'Planetary Remote Sensing',
    'Space-based Observation',
    'GPS & GNSS',
    'Geodesy',

    // Other
    'Other',
] as const;

export type ResearchVector = typeof RESEARCH_VECTORS[number];

// Grouped categories for organized display
export const RESEARCH_VECTOR_GROUPS = {
    'Core Remote Sensing': [
        'Land Cover Change',
        'Land Use Land Cover (LULC)',
        'Satellite Image Processing',
        'Multispectral Analysis',
        'Hyperspectral Remote Sensing',
        'SAR (Synthetic Aperture Radar)',
        'LiDAR & Point Cloud',
        'Thermal Remote Sensing',
        'Optical Remote Sensing',
        'UAV / Drone Mapping',
    ],
    'Vegetation & Agriculture': [
        'Vegetation Index (NDVI/EVI)',
        'Agriculture & Crop Monitoring',
        'Precision Agriculture',
        'Forestry & Deforestation',
        'Soil Analysis',
    ],
    'Water & Climate': [
        'Hydrology & Watershed',
        'Flood Mapping & Monitoring',
        'Climate Analysis',
        'Oceanography & Coastal',
        'Snow & Glacier Monitoring',
        'Water Quality Assessment',
    ],
    'Urban & Infrastructure': [
        'Urban GIS & Planning',
        'Urban Heat Island',
        'Smart City Analytics',
        'Transportation GIS',
        'Infrastructure Mapping',
        'Building Footprint Extraction',
    ],
    'Environment & Hazards': [
        'Environmental Monitoring',
        'Air Quality & Pollution',
        'Disaster Risk Management',
        'Earthquake & Seismic Analysis',
        'Wildfire Detection & Mapping',
        'Landslide Susceptibility',
        'Erosion & Sedimentation',
    ],
    'Terrain & Geology': [
        'DEM & Terrain Analysis',
        'Geological Mapping',
        'Geomorphology',
        'Bathymetry',
        'Topographic Surveying',
    ],
    'Spatial Analysis & Modeling': [
        'Spatial Data Analysis',
        'Geostatistics',
        'Machine Learning in RS',
        'Deep Learning & AI',
        'Object Detection (OBIA)',
        'Change Detection',
        'Time Series Analysis',
        'Image Classification',
    ],
    'Data & Technology': [
        'Google Earth Engine',
        'Cloud Computing in GIS',
        'Web GIS & Mapping',
        'Geodatabase Management',
        'Open Source GIS (QGIS)',
        'ArcGIS Pro',
        'Photogrammetry',
    ],
    'Applications': [
        'Cadastral & Land Records',
        'Archaeological GIS',
        'Health GIS & Epidemiology',
        'Biodiversity & Ecology',
        'Marine & Fisheries GIS',
        'Mining & Resource Mapping',
        'Renewable Energy Siting',
        'Defense & Security GIS',
    ],
    'Planetary & Space': [
        'Planetary Remote Sensing',
        'Space-based Observation',
        'GPS & GNSS',
        'Geodesy',
    ],
} as const;
