/* global google */
import { loadScript } from '../../scripts/aem.js';

const DEFAULT_GOOGLE_MAPS_API_KEY = 'AIzaSyC9EwXy0QjV2u1LR0PrKNNR_lMJHr4dTGI';
const DEFAULT_COVERAGE_API = 'https://coveragefinderapi.mmitnetwork.com/coverage';

function readConfig(block) {
  const rows = block.querySelectorAll(':scope > div');
  const config = {};
  rows.forEach((row) => {
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase().replace(/\s+/g, '-');
      const value = cells[1].textContent.trim();
      if (key && value) config[key] = value;
    }
  });
  return config;
}

let map;
let markers = [];

function createSearchForm() {
  const form = document.createElement('div');
  form.className = 'locator-search';
  form.innerHTML = `
    <p class="locator-required">*Required field</p>
    <div class="locator-form">
      <div class="locator-input-group">
        <label for="locator-zip">From city, state, or ZIP code*</label>
        <input type="text" id="locator-zip" placeholder="Enter ZIP code" required>
      </div>
      <div class="locator-select-group">
        <select id="locator-distance">
          <option value="25">25 miles</option>
          <option value="50">50 miles</option>
          <option value="75">75 miles</option>
          <option value="100">100 miles</option>
        </select>
      </div>
      <button class="locator-search-btn" type="button">SEARCH</button>
    </div>
    <p class="locator-facility-types">Facility Types</p>
  `;
  return form;
}

function createMapContainer() {
  const container = document.createElement('div');
  container.className = 'locator-map-results';
  container.innerHTML = `
    <div class="locator-map" id="locator-map"></div>
    <div class="locator-results">
      <h2 class="locator-welcome-title">Welcome</h2>
      <p class="locator-welcome-text">Please enter your information to begin your search.</p>
    </div>
  `;
  return container;
}

function clearMarkers() {
  markers.forEach((m) => m.setMap(null));
  markers = [];
}

function addMarker(location, title, info) {
  const marker = new google.maps.Marker({
    position: location,
    map,
    title,
  });

  const infoWindow = new google.maps.InfoWindow({ content: info });
  marker.addListener('click', () => infoWindow.open(map, marker));
  markers.push(marker);
}

function renderResults(results, resultsContainer) {
  if (!results || results.length === 0) {
    resultsContainer.innerHTML = `
      <h2 class="locator-no-results">No results found</h2>
      <p>Try expanding your search radius or entering a different location.</p>
    `;
    return;
  }

  let html = `<h2 class="locator-results-title">${results.length} location${results.length !== 1 ? 's' : ''} found</h2>`;
  html += '<ul class="locator-results-list">';

  results.forEach((result, index) => {
    const name = result.name || result.facilityName || `Location ${index + 1}`;
    const address = result.address || result.streetAddress || '';
    const city = result.city || '';
    const state = result.state || '';
    const zip = result.zip || result.zipCode || '';
    const phone = result.phone || result.phoneNumber || '';
    const fullAddress = [address, city, state, zip].filter(Boolean).join(', ');

    html += `
      <li class="locator-result-item">
        <h3>${name}</h3>
        <p class="locator-result-address">${fullAddress}</p>
        ${phone ? `<p class="locator-result-phone"><a href="tel:${phone}">${phone}</a></p>` : ''}
      </li>
    `;

    if (result.latitude && result.longitude) {
      const pos = { lat: parseFloat(result.latitude), lng: parseFloat(result.longitude) };
      addMarker(pos, name, `<strong>${name}</strong><br>${fullAddress}`);
    }
  });

  html += '</ul>';
  resultsContainer.innerHTML = html;
}

async function geocodeZip(zip) {
  const geocoder = new google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address: zip }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        resolve({ lat: loc.lat(), lng: loc.lng() });
      } else {
        reject(new Error(`Geocode failed: ${status}`));
      }
    });
  });
}

async function searchLocations(zip, distance, apiUrl) {
  const coords = await geocodeZip(zip);
  map.setCenter(coords);
  map.setZoom(10);

  try {
    const params = new URLSearchParams({
      latitude: coords.lat,
      longitude: coords.lng,
      radius: distance,
    });

    const response = await fetch(`${apiUrl}?${params}`);
    if (response.ok) {
      const data = await response.json();
      return data.results || data.providers || data || [];
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Coverage API call failed, using fallback:', e);
  }

  return [];
}

export default async function decorate(block) {
  const config = readConfig(block);
  const apiKey = config['google-maps-api-key'] || DEFAULT_GOOGLE_MAPS_API_KEY;
  const coverageApi = config['api-endpoint'] || DEFAULT_COVERAGE_API;

  block.textContent = '';

  const searchForm = createSearchForm();
  const mapContainer = createMapContainer();

  block.append(searchForm);
  block.append(mapContainer);

  await loadScript(`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`);

  map = new google.maps.Map(document.getElementById('locator-map'), {
    center: { lat: 37.09, lng: -95.71 },
    zoom: 4,
    mapTypeControl: false,
    streetViewControl: false,
  });

  const searchBtn = block.querySelector('.locator-search-btn');
  const zipInput = block.querySelector('#locator-zip');
  const distanceSelect = block.querySelector('#locator-distance');
  const resultsContainer = block.querySelector('.locator-results');

  async function handleSearch() {
    const zip = zipInput.value.trim();
    if (!zip) return;

    searchBtn.textContent = 'SEARCHING...';
    searchBtn.disabled = true;
    clearMarkers();

    try {
      const results = await searchLocations(zip, distanceSelect.value, coverageApi);
      renderResults(results, resultsContainer);
    } catch (e) {
      resultsContainer.innerHTML = '<p class="locator-error">Unable to search. Please check your input and try again.</p>';
    }

    searchBtn.textContent = 'SEARCH';
    searchBtn.disabled = false;
  }

  searchBtn.addEventListener('click', handleSearch);
  zipInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
}
