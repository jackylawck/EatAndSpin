// js/api/nearby.js
import { safeFetch } from './fetcher.js';

/**
 * 免費免 Key：根據 GPS 坐標自動獲取周圍 500 米內的 12 間真實餐廳 (OpenStreetMap)
 */
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
        votes: 1, // 預設 1 票
        indoor: true
      }))
      .filter(p => p.name) // 移除沒有名字的資料
      .slice(0, 12); // 取前 12 間
  }

  return [];
}
