import { fetchNearbyPlaces, fetchPlacesByAddress, filterPlaces, parseRestaurantName } from './api/nearby.js';
import { drawWheel, spinWheel } from './wheel.js';

let currentLang = 'zh';
let fetchedPool = [];   // 備用餐廳池
let currentItems = [];  // 輪盤目前顯示的餐廳

document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  setDefaultSetMenu();
});

function initEvents() {
  document.getElementById('btnLangZh')?.addEventListener('click', () => switchLanguage('zh'));
  document.getElementById('btnLangEn')?.addEventListener('click', () => switchLanguage('en'));

  document.getElementById('btnGeo')?.addEventListener('click', handleGeoSearch);

  document.getElementById('btnSearchLoc')?.addEventListener('click', handleAddressSearch);
  document.getElementById('locationInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddressSearch();
  });

  document.getElementById('btnAddItem')?.addEventListener('click', handleAddCustomItem);
  document.getElementById('btnReplenish')?.addEventListener('click', handleReplenish);

  document.getElementById('spinBtn')?.addEventListener('click', () => {
    if (currentItems.length === 0) {
      alert(currentLang === 'en' ? 'Please add at least one item!' : '請先新增至少一個選項！');
      return;
    }
    spinWheel(currentItems);
  });
}

async function handleGeoSearch() {
  const btn = document.getElementById('btnGeo');
  const originalText = btn.innerText;
  btn.innerText = currentLang === 'en' ? '📡 Locating...' : '📡 定位中...';
  btn.disabled = true;

  if (!navigator.geolocation) {
    alert(currentLang === 'en' ? 'Geolocation is not supported.' : '瀏覽器不支援 GPS 定位。');
    btn.innerText = originalText;
    btn.disabled = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const rawPlaces = await fetchNearbyPlaces(latitude, longitude);
        processSearchResults(rawPlaces);
      } catch (err) {
        alert(currentLang === 'en' ? 'Failed to fetch nearby places.' : '無法取得周邊餐廳資料。');
      } finally {
        btn.innerText = originalText;
        btn.disabled = false;
      }
    },
    () => {
      alert(currentLang === 'en' ? 'Geolocation access denied.' : '無法存取 GPS 位置。');
      btn.innerText = originalText;
      btn.disabled = false;
    }
  );
}

async function handleAddressSearch() {
  const input = document.getElementById('locationInput');
  const query = input.value.trim();
  if (!query) return;

  const btn = document.getElementById('btnSearchLoc');
  const originalText = btn.innerText;
  btn.innerText = currentLang === 'en' ? 'Searching...' : '搜尋中...';
  btn.disabled = true;

  try {
    const rawPlaces = await fetchPlacesByAddress(query);
    processSearchResults(rawPlaces);
  } catch (err) {
    alert(currentLang === 'en' ? 'Location not found.' : '找不到該地點或網路失敗。');
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

function processSearchResults(rawPlaces) {
  const filtered = filterPlaces(rawPlaces);

  if (filtered.length === 0) {
    alert(currentLang === 'en' ? 'No matching restaurants found.' : '找不到符合條件的餐廳，請試著減少篩選條件。');
    return;
  }

  fetchedPool = filtered.map(item => ({
    name: parseRestaurantName(item.tags, currentLang),
    votes: 1
  }));

  currentItems = fetchedPool.slice(0, 12);
  renderItemList();
}

function renderItemList() {
  const itemList = document.getElementById('itemList');
  const btnReplenish = document.getElementById('btnReplenish');
  if (itemList) itemList.innerHTML = '';

  currentItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 8px; margin-bottom: 6px; background: rgba(255,255,255,0.05); border-radius: 8px;";
    li.innerHTML = `
      <span>${item.name} (${item.votes}票)</span>
      <div>
        <button onclick="window.adjustVote(${index}, 1)" style="padding: 2px 8px; margin-right: 4px;">+</button>
        <button onclick="window.adjustVote(${index}, -1)" style="padding: 2px 8px; margin-right: 8px;">-</button>
        <button onclick="window.removeItem(${index})" style="background: none; border: none; cursor: pointer; color: #ff4757;">❌</button>
      </div>
    `;
    if (itemList) itemList.appendChild(li);
  });

  if (btnReplenish) {
    if (currentItems.length < 12 && fetchedPool.length > currentItems.length) {
      btnReplenish.style.display = 'block';
    } else {
      btnReplenish.style.display = 'none';
    }
  }

  // 安全畫輪盤
  if (typeof drawWheel === 'function') {
    drawWheel(currentItems);
  }
}

window.adjustVote = function(index, delta) {
  if (currentItems[index]) {
    currentItems[index].votes = Math.max(1, currentItems[index].votes + delta);
    renderItemList();
  }
};

window.removeItem = function(index) {
  currentItems.splice(index, 1);
  renderItemList();
};

function handleReplenish() {
  const needed = 12 - currentItems.length;
  if (needed <= 0) return;

  const unused = fetchedPool.filter(p => !currentItems.some(c => c.name === p.name));
  const additions = unused.slice(0, needed);

  if (additions.length > 0) {
    currentItems.push(...additions);
    renderItemList();
  } else {
    alert(currentLang === 'en' ? 'No more nearby restaurants available.' : '附近暫無更多符合條件的餐廳！');
  }
}

function handleAddCustomItem() {
  const input = document.getElementById('customInput');
  const name = input?.value.trim();
  if (!name) return;

  currentItems.push({ name, votes: 1 });
  if (input) input.value = '';
  renderItemList();
}

function switchLanguage(lang) {
  currentLang = lang;
  renderItemList();
}

function setDefaultSetMenu() {
  currentItems = [
    { name: 'A餐：干炒牛河', votes: 1 },
    { name: 'B餐：焗豬扒飯', votes: 1 },
    { name: 'C餐：餐肉煎蛋飯', votes: 1 },
    { name: 'D餐：雲吞麵', votes: 1 }
  ];
  renderItemList();
}
