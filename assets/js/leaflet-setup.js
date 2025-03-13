// Leaflet setup and initialization

// Add Leaflet CSS to head
const leafletCSS = document.createElement('link');
leafletCSS.rel = 'stylesheet';
leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
leafletCSS.crossOrigin = '';
document.head.appendChild(leafletCSS);

// Add Leaflet JavaScript to head
const leafletScript = document.createElement('script');
leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
leafletScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
leafletScript.crossOrigin = '';
document.head.appendChild(leafletScript);

// Wait for Leaflet to load before initializing maps
leafletScript.onload = () => {
    console.log('Leaflet loaded successfully');
    // Initialize maps if their tabs are active
    if (document.getElementById('radar-content')?.classList.contains('active')) {
        initRadarMap();
    }
    if (document.getElementById('temperature-content')?.classList.contains('active')) {
        initTemperatureMap();
    }
};