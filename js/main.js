import { fetchNearbyPlaces, fetchPlacesByAddress, filterPlaces, parseRestaurantName } from './api/nearby.js';
import { drawWheel, spinWheel } from './wheel.js';

let currentLang = 'zh';
let fetchedPool = [];   // 儲存 API 抓到的所有備用餐廳 (過濾後)
let currentItems = [];  // 輪盤上目前顯示的 12 間餐廳

// 頁面載入完成初始化
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  // 預設載入一組預設選單
  setDefaultSetMenu();
});

function initEvents() {
  // 語言切換
  document.getElementById('btnLangZh')?.addEventListener('click', () => switchLanguage('zh'));
  document.getElementById('btnLangEn')?.addEventListener('click', () => switchLanguage('en'));

  // GPS 位置搜尋
  document.getElementById('btnGeo')?.addEventListener('click', handleGeoSearch);

  // 地點文字搜尋
  document.getElementById('btnSearchLoc')?.addEventListener('click', handleAddressSearch);
  document.getElementById('locationInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddressSearch();
  });

  // 手動新增選項
  document.getElementById('btnAddItem')?.addEventListener('click', handleAddCustomItem);

  // 補抓備用餐廳
  document.getElementById('btnReplenish')?.addEventListener('click', handleReplenish);

  // 轉動輪盤
  document.getElementById('spinBtn')?.addEventListener('click', () => {
    if (currentItems.length === 0) {
      alert(currentLang === 'en' ? 'Please add at least one item!' : '請先新增至少一個選項！');
      return;
    }
    spinWheel(currentItems);
  });
}

// 處理 GPS 定位搜尋
async function handleGeoSearch() {
  const btn = document.getElementById('btnGeo');
  const originalText = btn.innerText;
  btn.innerText = currentLang === 'en' ? '📡 Locating...' : '📡 定位中...';
  btn.disabled = true;

  if (!navigator.geolocation) {
    alert(currentLang === 'en' ? 'Geolocation is not supported by your browser.' : '你的瀏覽器不支援 GPS 定位。');
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
        alert(currentLang === 'en' ? 'Failed to fetch nearby places.' : '無法取得周邊餐廳資料，請稍後再試。');
      } finally {
        btn.innerText = originalText;
        btn.disabled = false;
      }
    },
    (err) => {
      alert(currentLang === 'en' ? 'Geolocation access denied.' : '無法存取 GPS 位置，請檢查權限設定。');
      btn.innerText = originalText;
      btn.disabled = false;
    }
  );
}

// 處理地區/地址搜尋
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
    alert(currentLang === 'en' ? 'Location not found or network error.' : '找不到該地點或網路連線失敗。');
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

// 處理 API 回傳結果：套用過濾與名稱解析
function processSearchResults(rawPlaces) {
  // 1. 執行 Chips 事前類別過濾
  const filtered = filterPlaces(rawPlaces);

  if (filtered.length === 0) {
    alert(currentLang === 'en' ? 'No matching restaurants found.' : '找不到符合條件的餐廳，請嘗試放寬篩選標籤。');
    return;
  }

  // 2. 解析名稱並轉換為選單格式
  fetchedPool = filtered.map(item => ({
    name: parseRestaurantName(item.tags, currentLang),
    votes: 1,
    lat: item.lat,
    lon: item.lon
  }));

  // 3. 預設取首 12 間放入輪盤
  currentItems = fetchedPool.slice(0, 12);
  renderItemList();
}

// 渲染列表 (包含 ❌ 刪除按鈕)
function renderItemList() {
  const itemList = document.getElementById('itemList');
  const btnReplenish = document.getElementById('btnReplenish');
  itemList.innerHTML = '';

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
    itemList.appendChild(li);
  });

  // 顯示/隱藏補抓按鈕 (當少於 12 間且池中還有貨時)
  if (currentItems.length < 12 && fetchedPool.length > currentItems.length) {
    btnReplenish.style.display = 'block';
  } else {
    btnReplenish.style.display = 'none';
  }

  // 重繪 Canvas 輪盤
  drawWheel(currentItems);
}

// 全域掛載：手動調整票數
window.adjustVote = function(index, delta) {
  if (currentItems[index]) {
    currentItems[index].votes = Math.max(1, currentItems[index].votes + delta);
    renderItemList();
  }
};

// 全域掛載：刪除指定選項
window.removeItem = function(index) {
  currentItems.splice(index, 1);
  renderItemList();
};

// 補抓備用餐廳
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

// 手動新增自訂選項
function handleAddCustomItem() {
  const input = document.getElementById('customInput');
  const name = input.value.trim();
  if (!name) return;

  currentItems.push({ name, votes: 1 });
  input.value = '';
  renderItemList();
}

// 切換語言
function switchLanguage(lang) {
  currentLang = lang;
  // 重新按語言更新現有項目名稱
  renderItemList();
}

// 預設 ABCD 餐選單
function setDefaultSetMenu() {
  currentItems = [
    { name: 'A餐：干炒牛河', votes: 1 },
    { name: 'B餐：焗豬扒飯', votes: 1 },
    { name: 'C餐：餐肉煎蛋飯', votes: 1 },
    { name: 'D餐：雲吞麵', votes: 1 }
  ];
  renderItemList();
}
