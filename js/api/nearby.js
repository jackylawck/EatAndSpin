import { GOOGLE_API_KEY } from '../config.js';

// 1. 解析餐廳名稱 (Google API 已內建語言對應)
export function parseRestaurantName(place, currentLang = 'zh') {
  if (!place) return currentLang === 'en' ? 'Unnamed Restaurant' : '未命名餐廳';
  return place.displayName?.text || place.name || '未命名餐廳';
}

// 2. 根據 Chips 晶片按鈕進行篩選
export function filterPlaces(elements) {
  if (!Array.isArray(elements)) return [];

  const noCafe = document.getElementById('filterNoCafe')?.checked;
  const selectedCuisines = Array.from(document.querySelectorAll('.cuisine-filter:checked')).map(el => el.value);

  return elements.filter(item => {
    const name = (item.displayName?.text || '').toLowerCase();
    const primaryType = (item.primaryType || '').toLowerCase();
    const types = (item.types || []).join(' ').toLowerCase();

    // 剔除 Cafe / 咖啡店
    if (noCafe) {
      if (primaryType.includes('cafe') || primaryType.includes('coffee') || name.includes('coffee') || name.includes('cafe') || name.includes('咖啡')) {
        return false;
      }
    }

    // 菜式類別篩選
    if (selectedCuisines.length > 0) {
      const matches = selectedCuisines.some(type => {
        if (type === 'chinese') return types.includes('chinese') || types.includes('cantonese') || name.includes('中') || name.includes('點心') || name.includes('粵') || name.includes('酒樓') || name.includes('飯');
        if (type === 'japanese') return types.includes('japanese') || types.includes('korean') || name.includes('日') || name.includes('韓') || name.includes('壽司') || name.includes('居酒屋');
        if (type === 'asian') return types.includes('asian') || types.includes('noodle') || types.includes('thai') || types.includes('vietnamese') || name.includes('麵') || name.includes('泰') || name.includes('越') || name.includes('米線');
        if (type === 'western') return types.includes('western') || types.includes('pizza') || types.includes('italian') || types.includes('burger') || name.includes('西') || name.includes('披薩') || name.includes('意');
        return false;
      });
      if (!matches) return false;
    }

    return true;
  });
}

// 3. 按 GPS 坐標搜尋周邊營業中餐廳 (Google Places Nearby Search API)
export async function fetchNearbyPlaces(lat, lng) {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';

  const requestBody = {
    includedTypes: ['restaurant', 'fast_food_restaurant'],
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 800.0 // 搜尋周圍 800 米
      }
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'places.displayName,places.primaryType,places.types,places.businessStatus'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error('Google Places API Error');
  }

  const data = await response.json();
  const places = data.places || [];

  // 自動過濾非營業中 (OPERATIONAL) 的地點
  return places.filter(place => place.businessStatus === 'OPERATIONAL');
}

// 4. 按地區/地址搜尋餐廳 (Google Text Search API)
export async function fetchPlacesByAddress(address) {
  const url = 'https://places.googleapis.com/v1/places:searchText';

  const requestBody = {
    textQuery: `${address} Hong Kong restaurant`,
    maxResultCount: 20
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'places.displayName,places.primaryType,places.types,places.businessStatus'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error('Google Places Text Search Error');
  }

  const data = await response.json();
  const places = data.places || [];

  return places.filter(place => place.businessStatus === 'OPERATIONAL');
}
