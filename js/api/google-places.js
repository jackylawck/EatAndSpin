import { safeFetch } from './fetcher.js';

// 請在 Google Cloud 申請免費 API Key 貼在此處
const GOOGLE_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY';

/**
 * 根據 GPS 坐標自動獲取周圍 500 米內的 12 間真實餐廳
 */
export async function fetchNearbyPlaces(lat, lng) {
  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') {
    console.warn("未設定有效 Google API Key");
    return [];
  }

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&type=restaurant&key=${GOOGLE_API_KEY}`;
  
  const data = await safeFetch(url, {}, 5000);

  if (data && data.results && data.results.length > 0) {
    return data.results.slice(0, 12).map(place => ({
      name: place.name,
      votes: 1, // 預設 1 票
      indoor: true,
      rating: place.rating || 'N/A'
    }));
  }

  return [];
}
