// Weather.js - Open Meteo weather functionality

// Base URL for Open Meteo API
const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1";
const GEO_BASE_URL = "https://geocoding-api.open-meteo.com/v1";

// Default location (São Paulo, BR)
let currentLocation = {
    name: "São Paulo, BR",
    lat: -23.5505,
    lng: -46.6333
};

// DOM Elements
let weatherSection;
let weatherTabs;
let weatherContents;
let searchInput;
let searchButton;
let currentWeatherContainer;
let forecastContainer;
let radarContainer;
let temperatureContainer;

// Initialize weather functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initWeatherSection();
});

// Initialize the weather section
function initWeatherSection() {
    // Get DOM elements
    weatherSection = document.getElementById('weather');
    if (!weatherSection) return;
    
    weatherTabs = weatherSection.querySelectorAll('.weather-tab');
    weatherContents = weatherSection.querySelectorAll('.weather-content');
    searchInput = weatherSection.querySelector('.weather-search input');
    searchButton = weatherSection.querySelector('.weather-search button');
    currentWeatherContainer = document.getElementById('current-weather-container');
    forecastContainer = document.getElementById('forecast-container');
    radarContainer = document.getElementById('radar-container');
    temperatureContainer = document.getElementById('temperature-container');
    
    // Set up event listeners
    setupTabNavigation();
    setupSearch();
    
    // Load initial weather data
    getCurrentWeather(currentLocation.lat, currentLocation.lng);
    getForecast(currentLocation.lat, currentLocation.lng);
    
    // Initialize maps when their tabs are clicked
    document.getElementById('radar-tab').addEventListener('click', initRadarMap);
    document.getElementById('temperature-tab').addEventListener('click', initTemperatureMap);
}

// Set up tab navigation
function setupTabNavigation() {
    weatherTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            weatherTabs.forEach(t => t.classList.remove('active'));
            weatherContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const contentId = tab.getAttribute('data-content');
            document.getElementById(contentId).classList.add('active');
        });
    });
}

// Set up search functionality
function setupSearch() {
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Perform location search
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    try {
        // Show loading state
        currentWeatherContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        // Search for location using Open Meteo Geocoding API
        const locationUrl = `${GEO_BASE_URL}/search?name=${encodeURIComponent(query)}&count=1`;
        const response = await fetch(locationUrl);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const location = data.results[0];
            // Update current location
            currentLocation = {
                name: `${location.name}, ${location.country_code}`,
                lat: location.latitude,
                lng: location.longitude
            };
            
            // Update weather data
            getCurrentWeather(currentLocation.lat, currentLocation.lng);
            getForecast(currentLocation.lat, currentLocation.lng);
            
            // Update maps if they're visible
            if (document.getElementById('radar-content').classList.contains('active')) {
                initRadarMap();
            }
            if (document.getElementById('temperature-content').classList.contains('active')) {
                initTemperatureMap();
            }
        } else {
            currentWeatherContainer.innerHTML = '<p>Location not found. Please try again.</p>';
        }
    } catch (error) {
        console.error('Error searching for location:', error);
        currentWeatherContainer.innerHTML = '<p>Error searching for location. Please try again.</p>';
    }
}

// Get weather information based on WMO weather code
function getWeatherInfo(code) {
    const weatherCodes = {
        0: { description: 'Clear sky', icon: 'https://openweathermap.org/img/wn/01d@2x.png' },
        1: { description: 'Mainly clear', icon: 'https://openweathermap.org/img/wn/02d@2x.png' },
        2: { description: 'Partly cloudy', icon: 'https://openweathermap.org/img/wn/03d@2x.png' },
        3: { description: 'Overcast', icon: 'https://openweathermap.org/img/wn/04d@2x.png' },
        45: { description: 'Foggy', icon: 'https://openweathermap.org/img/wn/50d@2x.png' },
        48: { description: 'Depositing rime fog', icon: 'https://openweathermap.org/img/wn/50d@2x.png' },
        51: { description: 'Light drizzle', icon: 'https://openweathermap.org/img/wn/09d@2x.png' },
        53: { description: 'Moderate drizzle', icon: 'https://openweathermap.org/img/wn/09d@2x.png' },
        55: { description: 'Dense drizzle', icon: 'https://openweathermap.org/img/wn/09d@2x.png' },
        61: { description: 'Slight rain', icon: 'https://openweathermap.org/img/wn/10d@2x.png' },
        63: { description: 'Moderate rain', icon: 'https://openweathermap.org/img/wn/10d@2x.png' },
        65: { description: 'Heavy rain', icon: 'https://openweathermap.org/img/wn/10d@2x.png' },
        71: { description: 'Slight snow fall', icon: 'https://openweathermap.org/img/wn/13d@2x.png' },
        73: { description: 'Moderate snow fall', icon: 'https://openweathermap.org/img/wn/13d@2x.png' },
        75: { description: 'Heavy snow fall', icon: 'https://openweathermap.org/img/wn/13d@2x.png' },
        77: { description: 'Snow grains', icon: 'https://openweathermap.org/img/wn/13d@2x.png' },
        80: { description: 'Slight rain showers', icon: 'https://openweathermap.org/img/wn/09d@2x.png' },
        81: { description: 'Moderate rain showers', icon: 'https://openweathermap.org/img/wn/09d@2x.png' },
        82: { description: 'Violent rain showers', icon: 'https://openweathermap.org/img/wn/09d@2x.png' },
        85: { description: 'Slight snow showers', icon: 'https://openweathermap.org/img/wn/13d@2x.png' },
        86: { description: 'Heavy snow showers', icon: 'https://openweathermap.org/img/wn/13d@2x.png' },
        95: { description: 'Thunderstorm', icon: 'https://openweathermap.org/img/wn/11d@2x.png' },
        96: { description: 'Thunderstorm with slight hail', icon: 'https://openweathermap.org/img/wn/11d@2x.png' },
        99: { description: 'Thunderstorm with heavy hail', icon: 'https://openweathermap.org/img/wn/11d@2x.png' }
    };
    
    return weatherCodes[code] || { description: 'Unknown', icon: 'https://openweathermap.org/img/wn/01d@2x.png' };
}

// Get current weather data
async function getCurrentWeather(lat, lng) {
    try {
        // Show loading state
        currentWeatherContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        // Fetch current conditions from Open Meteo API
        const currentUrl = `${OPEN_METEO_BASE_URL}/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,pressure_msl,visibility&timezone=auto`;
        const response = await fetch(currentUrl);
        const data = await response.json();
        
        if (data.current) {
            const current = data.current;
            const weatherCode = current.weather_code;
            
            // Format date
            const date = new Date(current.time);
            const formattedDate = date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Get weather description and icon based on WMO code
            const weatherInfo = getWeatherInfo(weatherCode);
            
            // Build HTML for current weather
            const html = `
                <div class="weather-main">
                    <div class="weather-location">${currentLocation.name}</div>
                    <div class="weather-date">${formattedDate}</div>
                    <div class="weather-temp-container">
                        <div class="weather-temp">${Math.round(current.temperature_2m)}°C</div>
                        <img class="weather-icon" src="${weatherInfo.icon}" alt="${weatherInfo.description}">
                    </div>
                    <div class="weather-condition">${weatherInfo.description}</div>
                    <div class="weather-details">
                        <div class="weather-detail">
                            <div class="detail-label">Feels Like</div>
                            <div class="detail-value">${Math.round(current.apparent_temperature)}°C</div>
                        </div>
                        <div class="weather-detail">
                            <div class="detail-label">Wind</div>
                            <div class="detail-value">${Math.round(current.wind_speed_10m)} km/h</div>
                        </div>
                        <div class="weather-detail">
                            <div class="detail-label">Humidity</div>
                            <div class="detail-value">${current.relative_humidity_2m}%</div>
                        </div>
                        <div class="weather-detail">
                            <div class="detail-label">Precipitation</div>
                            <div class="detail-value">${current.precipitation} mm</div>
                        </div>
                        <div class="weather-detail">
                            <div class="detail-label">Pressure</div>
                            <div class="detail-value">${Math.round(current.pressure_msl)} hPa</div>
                        </div>
                        <div class="weather-detail">
                            <div class="detail-label">Visibility</div>
                            <div class="detail-value">${current.visibility / 1000} km</div>
                        </div>
                    </div>
                </div>
            `;
            
            currentWeatherContainer.innerHTML = html;
        } else {
            currentWeatherContainer.innerHTML = '<p>Weather data not available.</p>';
        }
    } catch (error) {
        console.error('Error fetching current weather:', error);
        currentWeatherContainer.innerHTML = '<p>Error loading weather data. Please try again.</p>';
    }
}

// Get forecast data
async function getForecast(lat, lng) {
    try {
        // Show loading state
        forecastContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        // Fetch 5-day forecast from Open Meteo API
        const forecastUrl = `${OPEN_METEO_BASE_URL}/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const response = await fetch(forecastUrl);
        const data = await response.json();
        
        if (data.daily) {
            let forecastHtml = '';
            
            // Build HTML for each forecast day
            for (let i = 0; i < 5; i++) {
                const date = new Date(data.daily.time[i]);
                const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const weatherInfo = getWeatherInfo(data.daily.weather_code[i]);
                
                forecastHtml += `
                    <div class="forecast-day">
                        <div class="forecast-date">${formattedDate}</div>
                        <img class="forecast-icon" src="${weatherInfo.icon}" alt="${weatherInfo.description}">
                        <div class="forecast-temp">${Math.round(data.daily.temperature_2m_max[i])}° / ${Math.round(data.daily.temperature_2m_min[i])}°</div>
                        <div class="forecast-condition">${weatherInfo.description}</div>
                    </div>
                `;
            }
            
            forecastContainer.innerHTML = forecastHtml;
        } else {
            forecastContainer.innerHTML = '<p>Forecast data not available.</p>';
        }
    } catch (error) {
        console.error('Error fetching forecast:', error);
        forecastContainer.innerHTML = '<p>Error loading forecast data. Please try again.</p>';
    }
}

// Initialize temperature color scale
function initTemperatureColorScale() {
    const container = document.getElementById('temperature-container');
    if (!container) return;
    
    const scaleHtml = `
        <div class="temperature-gradient">
            <div class="gradient-cold"></div>
            <div class="gradient-warm"></div>
            <div class="temperature-scale-marker" style="left: 0%">-10°C</div>
            <div class="temperature-scale-marker" style="left: 25%">0°C</div>
            <div class="temperature-scale-marker" style="left: 50%">15°C</div>
            <div class="temperature-scale-marker" style="left: 75%">30°C</div>
            <div class="temperature-scale-marker" style="left: 100%">45°C</div>
        </div>
    `;
    
    container.insertAdjacentHTML('afterbegin', scaleHtml);
}

// Initialize radar map
function initRadarMap() {
    const container = document.getElementById('radar-container');
    if (!container) return;

    container.innerHTML = '<div id="radar-map" style="height: 400px;"></div>';
    initWeatherMap('radar-map', [currentLocation.lat, currentLocation.lng]);
    loadRadarLayer(currentLocation.lat, currentLocation.lng);
}

// Initialize temperature map
function initTemperatureMap() {
    const container = document.getElementById('temperature-container');
    if (!container) return;

    container.innerHTML = '<div id="temperature-map" style="height: 400px;"></div>';
    initTemperatureColorScale();
    initWeatherMap('temperature-map', [currentLocation.lat, currentLocation.lng]);
    loadTemperatureLayer(currentLocation.lat, currentLocation.lng);
}

// Initialize weather map
function initWeatherMap(containerId, center) {
    // This function would initialize a map using a mapping library like Leaflet
    // For now, we'll just add a placeholder
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) return;
    
    mapContainer.innerHTML = '<div class="map-placeholder">Map would be displayed here</div>';
}

// Load radar layer
function loadRadarLayer(lat, lng) {
    // This function would load radar data onto the map
    // For now, we'll just add a placeholder
    console.log(`Loading radar data for ${lat}, ${lng}`);
}

// Load temperature layer
function loadTemperatureLayer(lat, lng) {
    // This function would load temperature data onto the map
    // For now, we'll just add a placeholder
    console.log(`Loading temperature data for ${lat}, ${lng}`);
}

// Helper function to get color based on temperature
function getTemperatureColor(temp) {
    if (temp < 0) {
        return '#9c27b0'; // Very cold (purple)
    } else if (temp < 10) {
        return '#3f51b5'; // Cold (blue)
    } else if (temp < 20) {
        return '#2196f3'; // Cool (light blue)
    } else if (temp < 25) {
        return '#00bcd4'; // Mild (cyan)
    } else if (temp < 30) {
        return '#4caf50'; // Warm (green)
    } else if (temp < 35) {
        return '#ffeb3b'; // Hot (yellow)
    } else {
        return '#f44336'; // Very hot (red)
    }
}