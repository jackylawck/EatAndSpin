// 1. 解析餐廳名稱（英文模式優先抓 name:en）
export function parseRestaurantName(tags, currentLang = 'zh') {
  if (currentLang === 'en') {
    // 英文模式：優先抓 name:en，沒有才退回 name
    return tags['name:en'] || tags['brand:en'] || tags['name'] || 'Unnamed Restaurant';
  }
  // 中文模式：優先抓 name:zh 或預設 name
  return tags['name:zh'] || tags['name'] || tags['name:en'] || '未命名餐廳';
}

// 2. 根據 Chips 進行事前篩選 (Filter)
export function filterPlaces(elements) {
  const noCafe = document.getElementById('filterNoCafe')?.checked;
  const selectedCuisines = Array.from(document.querySelectorAll('.cuisine-filter:checked')).map(el => el.value);

  return elements.filter(item => {
    const tags = item.tags || {};
    const amenity = (tags.amenity || '').toLowerCase();
    const cuisine = (tags.cuisine || '').toLowerCase();
    const name = (tags.name || '').toLowerCase();

    // 剔除 Cafe / 咖啡店
    if (noCafe) {
      if (amenity === 'cafe' || cuisine.includes('coffee') || name.includes('coffee') || name.includes('cafe')) {
        return false;
      }
    }

    // 菜式篩選
    if (selectedCuisines.length > 0) {
      return selectedCuisines.some(type => {
        if (type === 'chinese') return cuisine.includes('chinese') || cuisine.includes('cantonese') || cuisine.includes('dim_sum');
        if (type === 'japanese') return cuisine.includes('japanese') || cuisine.includes('korean') || cuisine.includes('sushi');
        if (type === 'asian') return cuisine.includes('noodle') || cuisine.includes('thai') || cuisine.includes('vietnamese');
        if (type === 'western') return cuisine.includes('western') || cuisine.includes('burger') || cuisine.includes('pizza');
        return false;
      });
    }

    return true;
  });
}
