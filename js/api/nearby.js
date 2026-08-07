// 1. 解析餐廳名稱 (支援英文 / 繁體中文)
export function parseRestaurantName(tags, currentLang = 'zh') {
  if (!tags) return currentLang === 'en' ? 'Unnamed Restaurant' : '未命名餐廳';
  if (currentLang === 'en') {
    return tags['name:en'] || tags['brand:en'] || tags['name'] || 'Unnamed Restaurant';
  }
  return tags['name:zh'] || tags['name'] || tags['name:en'] || '未命名餐廳';
}

// 2. 根據 Chips 晶片按鈕進行篩選 (Filter)
export function filterPlaces(elements) {
  if (!Array.isArray(elements)) return [];

  const noCafe = document.getElementById('filterNoCafe')?.checked;
  const selectedCuisines = Array.from(document.querySelectorAll('.cuisine-filter:checked')).map(el => el.value);

  return elements.filter(item => {
    const tags = item.tags || {};
    if (!tags.name) return false; // 排除沒有登記店名的地點

    const amenity = (tags.amenity || '').toLowerCase();
    const cuisine = (tags.cuisine || '').toLowerCase();
    const name = (tags.name || '').toLowerCase();

    // 剔除 Cafe / 咖啡店
    if (noCafe) {
      if (amenity === 'cafe' || cuisine.includes('coffee') || name.includes('coffee') || name.includes('cafe') || name.includes('咖啡')) {
        return false;
      }
    }

    // 菜式篩選
    if (selectedCuisines.length > 0) {
      const matches = selectedCuisines.some(type => {
        if (type === 'chinese') return cuisine.includes('chinese') || cuisine.includes('cantonese') || cuisine.includes('dim_sum') || name.includes('中') || name.includes('點心') || name.includes('粵') || name.includes('酒樓') || name.includes('飯');
        if (type === 'japanese') return cuisine.includes('japanese') || cuisine.includes('korean') || cuisine.includes('sushi') || name.includes('日') || name.includes('韓') || name.includes('壽司') || name.includes('居酒屋');
        if (type === 'asian') return cuisine.includes('noodle') || cuisine.includes('thai') || cuisine.includes('vietnamese') || name.includes('麵') || name.includes('泰') || name.includes('越') || name.includes('米線');
        if (type === 'western') return cuisine.includes('western') || cuisine.includes('burger') || cuisine.includes('pizza') || cuisine.includes('italian') || name.includes('西') || name.includes('披薩') || name.includes('意');
        return false;
      });
      if (!matches) return false;
    }

    return true;
  });
}

// 3. 按 GPS 坐標搜尋周邊餐廳 (Overpass API)
export async function fetchNearbyPlaces(lat, lng) {
  // 修正 Overpass QL 語法：使用 out center body; 避免語法解析失敗
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"restaurant|fast_food|cafe|food_court"](around:1000, ${lat}, ${lng});
      way["amenity"~"restaurant|fast_food|cafe|food_court"](around:1000, ${lat}, ${lng});
    );
    out center body;
  `;

  // 備用 API 節點列表 (若主伺服器忙碌自動切換備用節點)
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: `data=${encodeURIComponent(query)}`
      });

      if (response.ok) {
        const data = await response.json();
        return data.elements || [];
      }
    } catch (e) {
      console.warn(`Endpoint ${url} failed, trying next mirror...`, e);
    }
  }

  throw new Error('Overpass API Error');
}

// 4. 按地區/地址搜尋餐廳 (Nominatim API)
export async function fetchPlacesByAddress(address) {
  const baseUrl = 'https://nominatim.openstreetmap.org';
  const nominatimUrl = `${baseUrl}/search?format=json&q=${encodeURIComponent(address + ' Hong Kong')}`;
  
  const geoRes = await fetch(nominatimUrl);
  const geoData = await geoRes.json();

  if (!geoData || geoData.length === 0) {
    throw new Error('LOCATION_NOT_FOUND');
  }

  const lat = parseFloat(geoData[0].lat);
  const lon = parseFloat(geoData[0].lon);

  return await fetchNearbyPlaces(lat, lon);
}
