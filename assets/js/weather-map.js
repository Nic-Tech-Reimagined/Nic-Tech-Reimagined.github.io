// Weather Map functionality using Leaflet and Open Meteo API

// Ensure the Open Meteo API base URL is available
const OPEN_METEO_BASE_URL = OPEN_METEO_BASE_URL || "https://api.open-meteo.com/v1";

let weatherMap;
let temperatureLayer;
let radarLayer;
let temperatureColorScale;
let currentLocation = {
    name: "São Paulo, BR",
    lat: -23.5505,
    lng: -46.6333
};

// Initialize temperature color scale
const initTemperatureColorScale = () => {
    const colors = [
        { temp: -46, color: '#9164CD' },
        { temp: -20, color: '#4B44C4' },
        { temp: -10, color: '#3F8FD2' },
        { temp: 0, color: '#63B9E7' },
        { temp: 10, color: '#63CF6F' },
        { temp: 20, color: '#F6E447' },
        { temp: 30, color: '#F68847' },
        { temp: 40, color: '#E93E3A' },
        { temp: 54, color: '#BB2222' }
    ];

    temperatureColorScale = (temp) => {
        for (let i = 0; i < colors.length - 1; i++) {
            if (temp <= colors[i + 1].temp) {
                const ratio = (temp - colors[i].temp) / (colors[i + 1].temp - colors[i].temp);
                const color1 = colors[i].color;
                const color2 = colors[i + 1].color;
                return interpolateColor(color1, color2, ratio);
            }
        }
        return colors[colors.length - 1].color;
    };
};

// Color interpolation helper
const interpolateColor = (color1, color2, ratio) => {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

// Initialize weather map
const initWeatherMap = (containerId, center, zoom = 8) => {
    if (weatherMap) {
        weatherMap.remove();
    }

    weatherMap = L.map(containerId).setView(center, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(weatherMap);

    return weatherMap;
};

// Load temperature data
const loadTemperatureLayer = async (lat, lon) => {
    try {
        const response = await fetch(`${OPEN_METEO_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&timezone=auto`);
        const data = await response.json();

        if (temperatureLayer) {
            weatherMap.removeLayer(temperatureLayer);
        }

        const temp = data.hourly.temperature_2m[0];
        const color = temperatureColorScale(temp);

        temperatureLayer = L.circle([lat, lon], {
            radius: 20000,
            color: color,
            fillColor: color,
            fillOpacity: 0.5
        }).addTo(weatherMap);

        return true;
    } catch (error) {
        console.error('Error loading temperature data:', error);
        return false;
    }
};

// Load radar data
const loadRadarLayer = async (lat, lon) => {
    try {
        const response = await fetch(`${OPEN_METEO_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation&timezone=auto`);
        const data = await response.json();

        if (radarLayer) {
            weatherMap.removeLayer(radarLayer);
        }

        const precipitation = data.hourly.precipitation[0];
        const opacity = Math.min(precipitation / 10, 1);

        radarLayer = L.circle([lat, lon], {
            radius: 20000,
            color: '#0066FF',
            fillColor: '#0066FF',
            fillOpacity: opacity
        }).addTo(weatherMap);

        return true;
    } catch (error) {
        console.error('Error loading radar data:', error);
        return false;
    }
};

// Initialize temperature map
const initTemperatureMap = async () => {
    const container = document.getElementById('temperature-container');
    if (!container) return;

    container.innerHTML = '<div id="temperature-map" style="height: 400px;"></div>';
    initTemperatureColorScale();
    initWeatherMap('temperature-map', [currentLocation.lat, currentLocation.lng]);
    await loadTemperatureLayer(currentLocation.lat, currentLocation.lng);
};

// Initialize radar map
const initRadarMap = async () => {
    const container = document.getElementById('radar-container');
    if (!container) return;

    container.innerHTML = '<div id="radar-map" style="height: 400px;"></div>';
    initWeatherMap('radar-map', [currentLocation.lat, currentLocation.lng]);
    await loadRadarLayer(currentLocation.lat, currentLocation.lng);
};