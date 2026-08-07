import { fetchNearbyPlaces, fetchPlacesByAddress, filterPlaces, parseRestaurantName } from './api/nearby.js';
import { drawWheel, spinWheel } from './wheel.js';

let currentLang = 'zh'; // 'zh' 或 'en'
let currentMode = 'restaurant'; // 'restaurant' 或 'setmenu'
let rawSearchResults = []; // 儲存搜尋到的原始資料，供切換語言時重新翻譯名稱
let fetchedPool = [];
let currentItems = [];

// 全頁面 UI 雙語字典
const translations = {
  zh: {
    appTitle: '食一轉 · Eat & Spin',
    tabRestaurant: '🏪 搵餐廳 Mode',
    tabSetMenu: '🍱 揀 ABCD 餐 Mode',
    privacyBar: '🔒 <strong>隱私聲明：</strong> 本地運算，絕不上傳或儲存個人位置。',
    locationPlaceholder: '輸入地點 (例: 觀塘 / 中環 / 灣仔)',
    btnSearchLoc: '搜尋地點',
    filterTitle: '🎯 預先篩選類別：',
    btnGeo: '📡 使用目前 GPS 位置 (12間)',
    spinBtn: '食一轉！',
    sectionTitle: '🗳️ 餐廳選單與加權投票 (預設各 1 票)',
    btnReplenish: '🔄 補抓附近其他餐廳 (補滿 12 間)',
    customPlaceholder: '自己加選項 (例: F餐/特餐)',
    btnAddItem: '新增選項',
    defaultMenu: [
      { name: 'A餐：干炒牛河', votes: 1 },
      { name: 'B餐：焗豬扒飯', votes: 1 },
      { name: 'C餐：餐肉煎蛋飯', votes: 1 },
      { name: 'D餐：雲吞麵', votes: 1 }
    ]
  },
  en: {
    appTitle: 'Eat & Spin',
    tabRestaurant: '🏪 Find Restaurants',
    tabSetMenu: '🍱 Set Menu Mode',
    privacyBar: '🔒 <strong>Privacy Notice:</strong> Calculated locally. Location is never saved.',
    locationPlaceholder: 'Enter location (e.g., Central / Wan Chai)',
    btnSearchLoc: 'Search',
    filterTitle: '🎯 Filter Categories:',
    btnGeo: '📡 Use Current GPS (12)',
    spinBtn: 'Spin Now!',
    sectionTitle: '🗳️ Menu & Weighted Voting (Default 1 vote)',
    btnReplenish: '🔄 Load More Nearby Restaurants (Fill to 12)',
    customPlaceholder: 'Add custom item (e.g., Set F)',
    btnAddItem: 'Add Item',
    defaultMenu: [
      { name: 'Set A: Stir-fried Beef Noodles', votes: 1 },
      { name: 'Set B: Baked Pork Chop Rice', votes: 1 },
      { name: 'Set C: Luncheon Meat & Egg Rice', votes: 1 },
      { name: 'Set D: Wonton Noodles', votes: 1 }
    ]
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  initEvents();
  switchMode('restaurant');
  updateUIText();
}

function initEvents() {
  // 語言切換
  document.getElementById('btnLangZh')?.addEventListener('click', () => switchLanguage('zh'));
  document.getElementById('btnLangEn')?.addEventListener('click', () => switchLanguage('en'));

  // 模式切換 Tabs
  document.getElementById('tabRestaurant')?.addEventListener('click', () => switchMode('restaurant'));
  document.getElementById('tabSetMenu')?.addEventListener('click', () => switchMode('setmenu'));

  // 定位與搜尋
  document.getElementById('btnGeo')?.addEventListener('click', handleGeoSearch);
  document.getElementById('btnSearchLoc')?.addEventListener('click', handleAddressSearch);
  document.getElementById('locationInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddressSearch();
  });

  // 選項操作
  document.getElementById('btnAddItem')?.addEventListener('click', handleAddCustomItem);
  document.getElementById('btnReplenish')?.addEventListener('click', handleReplenish);

  // 轉輪盤
  document.getElementById('spinBtn')?.addEventListener('click', () => {
    if (currentItems.length === 0) {
      alert(currentLang === 'en' ? 'Please add at least one item!' : '請先新增至少一個選項！');
      return;
    }
    spinWheel(currentItems);
  });
}

// 模式切換邏輯 (搵餐廳 Mode vs 揀 ABCD 餐 Mode)
function switchMode(mode) {
  currentMode = mode;
  const tabRest = document.getElementById('tabRestaurant');
  const tabMenu = document.getElementById('tabSetMenu');
  const locBox = document.getElementById('locationSearchBox');

  if (mode === 'restaurant') {
    tabRest?.classList.add('active');
    tabMenu?.classList.remove('active');
    if (locBox) locBox.style.display = 'block';
    
    if (rawSearchResults.length > 0) {
      processSearchResults(rawSearchResults);
    } else {
      currentItems = [];
      renderItemList();
    }
  } else {
    tabMenu?.classList.add('active');
    tabRest?.classList.remove('active');
    if (locBox) locBox.style.display = 'none';

    // 載入當前語言的預設 ABCD 餐
    currentItems = JSON.parse(JSON.stringify(translations[currentLang].defaultMenu));
    renderItemList();
  }
}

// 語言切換核心函式
function switchLanguage(lang) {
  if (currentLang === lang) return;
  currentLang = lang;

  // 更新語言按鈕高亮
  const btnZh = document.getElementById('btnLangZh');
  const btnEn = document.getElementById('btnLangEn');
  if (lang === 'zh') {
    btnZh?.classList.add('active');
    btnEn?.classList.remove('active');
  } else {
    btnEn?.classList.add('active');
    btnZh?.classList.remove('active');
  }

  // 1. 即時刷新介面文字
  updateUIText();

  // 2. 根據目前模式刷新選項資料
  if (currentMode === 'setmenu') {
    currentItems = JSON.parse(JSON.stringify(translations[currentLang].defaultMenu));
    renderItemList();
  } else if (rawSearchResults.length > 0) {
    processSearchResults(rawSearchResults);
  } else {
    renderItemList();
  }
}

// 更新全頁面文字介面
function updateUIText() {
  const t = translations[currentLang];

  const appTitle = document.querySelector('[data-i18n="appTitle"]');
  if (appTitle) appTitle.innerText = t.appTitle;

  const tabRest = document.getElementById('tabRestaurant');
  if (tabRest) tabRest.innerText = t.tabRestaurant;

  const tabMenu = document.getElementById('tabSetMenu');
  if (tabMenu) tabMenu.innerText = t.tabSetMenu;

  const privacyBar = document.querySelector('.privacy-bar');
  if (privacyBar) privacyBar.innerHTML = t.privacyBar;

  const locInput = document.getElementById('locationInput');
  if (locInput) locInput.placeholder = t.locationPlaceholder;

  const btnSearchLoc = document.getElementById('btnSearchLoc');
  if (btnSearchLoc) btnSearchLoc.innerText = t.btnSearchLoc;

  const btnGeo = document.getElementById('btnGeo');
  if (btnGeo) btnGeo.innerText = t.btnGeo;

  const spinBtn = document.getElementById('spinBtn');
  if (spinBtn) spinBtn.innerText = t.spinBtn;

  const sectionTitle = document.getElementById('sectionTitle');
  if (sectionTitle) sectionTitle.innerText = t.sectionTitle;

  const btnReplenish = document.getElementById('btnReplenish');
  if (btnReplenish) btnReplenish.innerText = t.btnReplenish;

  const customInput = document.getElementById('customInput');
  if (customInput) customInput.placeholder = t.customPlaceholder;

  const btnAddItem = document.getElementById('btnAddItem');
  if (btnAddItem) btnAddItem.innerText = t.btnAddItem;
}

// GPS 位置搜尋
async function handleGeoSearch() {
  const btn = document.getElementById('btnGeo');
  if (!btn) return;
  const originalText = btn.innerText;
  btn.innerText = currentLang === 'en' ? '📡 Locating...' : '📡 定位中...';
  btn.disabled = true;

  if (!navigator.geolocation) {
    alert(currentLang === 'en' ? 'Geolocation not supported.' : '瀏覽器不支援 GPS 定位。');
    btn.innerText = originalText;
    btn.disabled = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        rawSearchResults = await fetchNearbyPlaces(pos.coords.latitude, pos.coords.longitude);
        processSearchResults(rawSearchResults);
      } catch (err) {
        alert(currentLang === 'en' ? 'Failed to fetch places.' : '無法取得周邊餐廳資料。');
      } finally {
        btn.innerText = originalText;
        btn.disabled = false;
      }
    },
    () => {
      alert(currentLang === 'en' ? 'GPS permission denied.' : '無法存取 GPS 位置。');
      btn.innerText = originalText;
      btn.disabled = false;
    }
  );
}

// 地點文字搜尋
async function handleAddressSearch() {
  const input = document.getElementById('locationInput');
  const query = input?.value.trim();
  if (!query) return;

  const btn = document.getElementById('btnSearchLoc');
  if (!btn) return;
  const originalText = btn.innerText;
  btn.innerText = currentLang === 'en' ? 'Searching...' : '搜尋中...';
  btn.disabled = true;

  try {
    rawSearchResults = await fetchPlacesByAddress(query);
    processSearchResults(rawSearchResults);
  } catch (err) {
    alert(currentLang === 'en' ? 'Location not found.' : '找不到該地點。');
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
}

// 處理 API 回傳結果
function processSearchResults(rawPlaces) {
  const filtered = filterPlaces(rawPlaces);

  if (filtered.length === 0) {
    alert(currentLang === 'en' ? 'No matching restaurants found.' : '找不到符合條件的餐廳，請調整篩選標籤。');
    return;
  }

  fetchedPool = filtered.map(item => ({
    name: parseRestaurantName(item.tags, currentLang),
    votes: 1
  }));

  currentItems = fetchedPool.slice(0, 12);
  renderItemList();
}

// 渲染列表與輪盤
function renderItemList() {
  const itemList = document.getElementById('itemList');
  const btnReplenish = document.getElementById('btnReplenish');
  if (itemList) itemList.innerHTML = '';

  currentItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 8px; margin-bottom: 6px; background: rgba(255,255,255,0.05); border-radius: 8px;";
    li.innerHTML = `
      <span>${item.name} (${item.votes}${currentLang === 'en' ? ' vote(s)' : '票'})</span>
      <div>
        <button onclick="window.adjustVote(${index}, 1)" style="padding: 2px 8px; margin-right: 4px;">+</button>
        <button onclick="window.adjustVote(${index}, -1)" style="padding: 2px 8px; margin-right: 8px;">-</button>
        <button onclick="window.removeItem(${index})" style="background: none; border: none; cursor: pointer; color: #ff4757;">❌</button>
      </div>
    `;
    if (itemList) itemList.appendChild(li);
  });

  if (btnReplenish) {
    btnReplenish.style.display = (currentMode === 'restaurant' && currentItems.length < 12 && fetchedPool.length > currentItems.length) ? 'block' : 'none';
  }

  drawWheel(currentItems);
}

// 全域掛載票數控制與刪除
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

// 補抓餐廳
function handleReplenish() {
  const needed = 12 - currentItems.length;
  if (needed <= 0) return;

  const unused = fetchedPool.filter(p => !currentItems.some(c => c.name === p.name));
  const additions = unused.slice(0, needed);

  if (additions.length > 0) {
    currentItems.push(...additions);
    renderItemList();
  } else {
    alert(currentLang === 'en' ? 'No more nearby restaurants.' : '附近暫無更多符合條件的餐廳！');
  }
}

// 手動新增選項
function handleAddCustomItem() {
  const input = document.getElementById('customInput');
  const name = input?.value.trim();
  if (!name) return;

  currentItems.push({ name, votes: 1 });
  if (input) input.value = '';
  renderItemList();
}
