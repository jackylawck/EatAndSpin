import { GOOGLE_API_KEY } from '../config.js';

// 1. 解析餐廳名稱
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
    const name = (item.displayName?.text || item.name || '').toLowerCase();
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

// 3. 按 GPS 坐標搜尋周邊餐廳
export async function fetchNearbyPlaces(lat, lng) {
  const url = 'https://places.googleapis.com/v1/places:searchText';

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    throw new Error('Invalid GPS Coordinates');
  }

  const requestBody = {
    textQuery: '餐廳',
    maxResultCount: 20,
    locationBias: {
      circle: {
        center: {
          latitude: latitude,
          longitude: longitude
        },
        radius: 800.0
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.primaryType,places.types,places.businessStatus'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google API Raw Response Error:', data);
      throw new Error(`Google API 400 Error: ${data.error?.message || response.statusText}`);
    }

    return (data.places || []).filter(place => !place.businessStatus || place.businessStatus === 'OPERATIONAL');
  } catch (err) {
    console.error('fetchNearbyPlaces failed:', err);
    throw err;
  }
}

// 4. 按地區/地址搜尋餐廳
export async function fetchPlacesByAddress(address) {
  const url = 'https://places.googleapis.com/v1/places:searchText';

  const requestBody = {
    textQuery: `${address} 香港 餐廳`,
    maxResultCount: 20
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.primaryType,places.types,places.businessStatus'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google Text Search Raw Response Error:', data);
      throw new Error(`Google API Error: ${data.error?.message || response.statusText}`);
    }

    return (data.places || []).filter(place => !place.businessStatus || place.businessStatus === 'OPERATIONAL');
  } catch (err) {
    console.error('fetchPlacesByAddress failed:', err);
    throw err;
  }
}
