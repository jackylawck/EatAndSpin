// js/api/nearby.js
import { safeFetch } from './fetcher.js';

// 根據經緯度搜尋 12 間真實餐廳
export async function fetchNearbyPlaces(lat, lng) {
  const query = `
    [out:json][timeout:5];
    (
      node["amenity"="restaurant"](around:500, ${lat}, ${lng});
      node["amenity"="fast_food"](around:500, ${lat}, ${lng});
      node["amenity"="cafe"](around:500, ${lat}, ${lng});
    );
    out body 20;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const data = await safeFetch(url, {}, 5000);

  if (data && data.elements && data.elements.length > 0) {
    return data.elements
      .map(place => ({
        name: place.tags?.name || place.tags?.['name:zh'] || place.tags?.['name:en'],
        votes: 1,
        indoor: true
      }))
      .filter(p => p.name)
      .slice(0, 12);
  }

  return [];
}

// 根據用戶輸入的地名（例：「觀塘」、「中環」）搜尋坐標並拉出 12 間餐廳
export async function fetchPlacesByAddress(addressText) {
  const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressText + ', Hong Kong')}`;
  const geoData = await safeFetch(geoUrl, {}, 5000);

  if (geoData && geoData.length > 0) {
    const lat = parseFloat(geoData[0].lat);
    const lng = parseFloat(geoData[0].lon);
    return await fetchNearbyPlaces(lat, lng);
  }

  return [];
}
