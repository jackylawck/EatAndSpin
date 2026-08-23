import { fetchNearbyPlaces, fetchPlacesByAddress, filterPlaces, parseRestaurantName } from './api/nearby.js';
import { drawWheel, spinWheel, initWheelResizeObserver } from './wheel.js';

// ==========================================
// 1. 雙語字典 (i18n Dictionary)
// ==========================================
const TRANSLATIONS = {
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
    locating: '📡 定位中...',
    searching: '🔍 搜尋中...',
    emptyAlert: '請先新增至少一個選項！',
    noMatches: '找不到符合條件的餐廳，請調整篩選標籤。',
    noMoreReplenish: '附近暫無更多符合條件的餐廳！',
    geoDenied: '無法存取 GPS 位置，請確認已開放權限。',
    geoUnsupported: '瀏覽器不支援 GPS 定位。',
    fetchFailed: '無法取得周邊餐廳資料，請稍後再試。',
    enterLocationPrompt: '請輸入有效之地點名稱。',
    voteUnit: '票',
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
    locating: '📡 Locating...',
    searching: '🔍 Searching...',
    emptyAlert: 'Please add at least one item!',
    noMatches: 'No matching restaurants found. Try adjusting filters.',
    noMoreReplenish: 'No more nearby restaurants available.',
    geoDenied: 'GPS permission denied. Please allow location access.',
    geoUnsupported: 'Geolocation is not supported by your browser.',
    fetchFailed: 'Failed to fetch places. Please try again later.',
    enterLocationPrompt: 'Please enter a valid location name.',
    voteUnit: ' vote(s)',
    defaultMenu: [
      { name: 'Set A: Stir-fried Beef Noodles', votes: 1 },
      { name: 'Set B: Baked Pork Chop Rice', votes: 1 },
      { name: 'Set C: Luncheon Meat & Egg Rice', votes: 1 },
      { name: 'Set D: Wonton Noodles', votes: 1 }
    ]
  }
};

// ==========================================
// 2. 集中式狀態管理 (State Management)
// ==========================================
class AppState {
  constructor() {
    this.lang = 'zh';
    this.mode = 'restaurant';
    this.rawSearchResults = [];
    this.fetchedPool = [];
    this.currentItems = [];
    this.removedItemNames = new Set();
    this.isLoading = false;
  }

  setLanguage(newLang) {
    if (this.lang === newLang) return;
    this.lang = newLang;
    if (this.mode === 'setmenu') {
      this.currentItems = JSON.parse(JSON.stringify(TRANSLATIONS[this.lang].defaultMenu));
    }
    UIRenderer.updateStaticTexts();
    UIRenderer.render();
  }

  setMode(newMode) {
    this.mode = newMode;
    if (newMode === 'restaurant') {
      if (this.rawSearchResults.length > 0) {
        this.processPlaces(this.rawSearchResults);
      } else {
        this.currentItems = [];
      }
    } else {
      this.currentItems = JSON.parse(JSON.stringify(TRANSLATIONS[this.lang].defaultMenu));
    }
    UIRenderer.render();
  }

  processPlaces(places) {
    this.rawSearchResults = places;
    const filtered = filterPlaces(places);
    
    if (filtered.length === 0) {
      showToast(TRANSLATIONS[this.lang].noMatches, 'warning');
      this.currentItems = [];
      this.fetchedPool = [];
      UIRenderer.render();
      return;
    }

    this.fetchedPool = filtered.map(item => ({
      name: parseRestaurantName(item, this.lang),
      votes: 1
    }));

    // 排除黑名單後取前 12 筆
    const available = this.fetchedPool.filter(p => !this.removedItemNames.has(p.name));
    this.currentItems = available.slice(0, 12);
    UIRenderer.render();
  }

  adjustVote(index, delta) {
    if (!this.currentItems[index]) return;
    this.currentItems[index].votes = Math.max(1, this.currentItems[index].votes + delta);
    UIRenderer.render();
  }

  removeItem(index) {
    if (!this.currentItems[index]) return;
    this.removedItemNames.add(this.currentItems[index].name);
    this.currentItems.splice(index, 1);
    UIRenderer.render();
  }

  replenishItems() {
    const needed = 12 - this.currentItems.length;
    if (needed <= 0) return;

    const currentNames = new Set(this.currentItems.map(item => item.name));
    const candidatePool = this.fetchedPool.filter(
      p => !currentNames.has(p.name) && !this.removedItemNames.has(p.name)
    );

    const additions = candidatePool.slice(0, needed);
    if (additions.length > 0) {
      this.currentItems.push(...additions);
      UIRenderer.render();
    } else {
      showToast(TRANSLATIONS[this.lang].noMoreReplenish, 'info');
    }
  }

  addCustomItem(name) {
    const cleanName = name.trim();
    if (!cleanName) return;
    this.currentItems.push({ name: cleanName, votes: 1 });
    UIRenderer.render();
  }
}

const state = new AppState();

// ==========================================
// 3. UI 渲染引擎 (DOM & Wheel Renderer)
// ==========================================
class UIRenderer {
  static init() {
    this.updateStaticTexts();
    this.render();
  }

  static updateStaticTexts() {
    const t = TRANSLATIONS[state.lang];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });

    const privacyBar = document.querySelector('.privacy-bar');
    if (privacyBar) privacyBar.innerHTML = t.privacyBar;

    const locInput = document.getElementById('locationInput');
    if (locInput) locInput.placeholder = t.locationPlaceholder;

    const customInput = document.getElementById('customInput');
    if (customInput) customInput.placeholder = t.customPlaceholder;

    // 語言按鈕狀態與 A11y
    const btnZh = document.getElementById('btnLangZh');
    const btnEn = document.getElementById('btnLangEn');
    btnZh?.classList.toggle('active', state.lang === 'zh');
    btnZh?.setAttribute('aria-pressed', state.lang === 'zh' ? 'true' : 'false');
    btnEn?.classList.toggle('active', state.lang === 'en');
    btnEn?.setAttribute('aria-pressed', state.lang === 'en' ? 'true' : 'false');
  }

  static render() {
    // 1. 切換 Tabs 與搜尋框顯示
    const isRestaurantMode = state.mode === 'restaurant';
    const tabRest = document.getElementById('tabRestaurant');
    const tabMenu = document.getElementById('tabSetMenu');

    tabRest?.classList.toggle('active', isRestaurantMode);
    tabRest?.setAttribute('aria-selected', isRestaurantMode ? 'true' : 'false');
    tabMenu?.classList.toggle('active', !isRestaurantMode);
    tabMenu?.setAttribute('aria-selected', !isRestaurantMode ? 'true' : 'false');

    const locBox = document.getElementById('locationSearchBox');
    if (locBox) locBox.style.display = isRestaurantMode ? 'block' : 'none';

    // 2. 渲染清單 (對齊 CSS 類別，XSS 安全)
    const listContainer = document.getElementById('itemList');
    if (listContainer) {
      listContainer.replaceChildren();

      state.currentItems.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'item-row';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'restaurant-name';
        titleSpan.textContent = `${item.name} (${item.votes}${TRANSLATIONS[state.lang].voteUnit})`;

        const actionDiv = document.createElement('div');
        actionDiv.className = 'vote-controls';

        const btnPlus = document.createElement('button');
        btnPlus.className = 'vote-btn';
        btnPlus.textContent = '+';
        btnPlus.dataset.action = 'vote-plus';
        btnPlus.dataset.index = index;
        btnPlus.setAttribute('aria-label', `增加 ${item.name} 票數`);

        const btnMinus = document.createElement('button');
        btnMinus.className = 'vote-btn';
        btnMinus.textContent = '-';
        btnMinus.dataset.action = 'vote-minus';
        btnMinus.dataset.index = index;
        btnMinus.setAttribute('aria-label', `減少 ${item.name} 票數`);

        const btnDelete = document.createElement('button');
        btnDelete.className = 'vote-btn';
        btnDelete.textContent = '❌';
        btnDelete.dataset.action = 'delete';
        btnDelete.dataset.index = index;
        btnDelete.style.color = '#ff4757';
        btnDelete.setAttribute('aria-label', `刪除 ${item.name}`);

        actionDiv.append(btnPlus, btnMinus, btnDelete);
        li.append(titleSpan, actionDiv);
        listContainer.appendChild(li);
      });
    }

    // 3. 計算補抓按鈕顯示狀態
    const btnReplenish = document.getElementById('btnReplenish');
    if (btnReplenish) {
      const currentNames = new Set(state.currentItems.map(i => i.name));
      const hasUnused = state.fetchedPool.some(p => !currentNames.has(p.name) && !state.removedItemNames.has(p.name));
      btnReplenish.style.display = (isRestaurantMode && state.currentItems.length < 12 && hasUnused) ? 'block' : 'none';
    }

    // 4. 重繪 Canvas 輪盤
    drawWheel(state.currentItems);
  }
}

// ==========================================
// 4. 現代事件監聽與委派 (Event Listeners)
// ==========================================
function setupEventListeners() {
  // 語言切換
  document.getElementById('btnLangZh')?.addEventListener('click', () => state.setLanguage('zh'));
  document.getElementById('btnLangEn')?.addEventListener('click', () => state.setLanguage('en'));

  // 模式切換
  document.getElementById('tabRestaurant')?.addEventListener('click', () => state.setMode('restaurant'));
  document.getElementById('tabSetMenu')?.addEventListener('click', () => state.setMode('setmenu'));

  // GPS 搜尋
  document.getElementById('btnGeo')?.addEventListener('click', handleGeolocationSearch);

  // 地址文字搜尋
  document.getElementById('btnSearchLoc')?.addEventListener('click', handleTextLocationSearch);
  document.getElementById('locationInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleTextLocationSearch();
  });

  // 篩選 Checkbox 連動
  document.querySelectorAll('#filterNoCafe, .cuisine-filter').forEach(cb => {
    cb.addEventListener('change', () => {
      if (state.rawSearchResults.length > 0) {
        state.processPlaces(state.rawSearchResults);
      }
    });
  });

  // 自訂項目
  document.getElementById('btnAddItem')?.addEventListener('click', handleCustomItemAdd);
  document.getElementById('customInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleCustomItemAdd();
  });

  // 補抓按鈕
  document.getElementById('btnReplenish')?.addEventListener('click', () => state.replenishItems());

  // 統一列表事件委派 (Delegation)
  document.getElementById('itemList')?.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    const action = target.dataset.action;
    const index = parseInt(target.dataset.index, 10);
    if (isNaN(index)) return;

    if (action === 'vote-plus') state.adjustVote(index, 1);
    if (action === 'vote-minus') state.adjustVote(index, -1);
    if (action === 'delete') state.removeItem(index);
  });

  // 啟動轉盤
  document.getElementById('spinBtn')?.addEventListener('click', () => {
    if (state.currentItems.length === 0) {
      showToast(TRANSLATIONS[state.lang].emptyAlert, 'warning');
      return;
    }
    spinWheel(state.currentItems, state.lang);
  });
}

// ==========================================
// 5. 業務處理函數 (Business Logic)
// ==========================================
async function handleGeolocationSearch() {
  const btn = document.getElementById('btnGeo');
  if (!btn || state.isLoading) return;

  if (!navigator.geolocation) {
    showToast(TRANSLATIONS[state.lang].geoUnsupported, 'error');
    return;
  }

  const defaultText = btn.textContent;
  btn.textContent = TRANSLATIONS[state.lang].locating;
  btn.disabled = true;
  state.isLoading = true;

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        state.removedItemNames.clear();
        const places = await fetchNearbyPlaces(pos.coords.latitude, pos.coords.longitude);
        state.processPlaces(places);
      } catch (err) {
        console.error('Geo Search Error:', err);
        showToast(TRANSLATIONS[state.lang].fetchFailed, 'error');
      } finally {
        btn.textContent = defaultText;
        btn.disabled = false;
        state.isLoading = false;
      }
    },
    (err) => {
      console.warn('Geolocation Permission Error:', err);
      showToast(TRANSLATIONS[state.lang].geoDenied, 'warning');
      btn.textContent = defaultText;
      btn.disabled = false;
      state.isLoading = false;
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

async function handleTextLocationSearch() {
  const input = document.getElementById('locationInput');
  const query = input?.value.trim();
  if (!query) {
    showToast(TRANSLATIONS[state.lang].enterLocationPrompt, 'info');
    return;
  }

  const btn = document.getElementById('btnSearchLoc');
  if (!btn || state.isLoading) return;

  const defaultText = btn.textContent;
  btn.textContent = TRANSLATIONS[state.lang].searching;
  btn.disabled = true;
  state.isLoading = true;

  try {
    state.removedItemNames.clear();
    const places = await fetchPlacesByAddress(query);
    state.processPlaces(places);
  } catch (err) {
    console.error('Address Search Error:', err);
    showToast(TRANSLATIONS[state.lang].fetchFailed, 'error');
  } finally {
    btn.textContent = defaultText;
    btn.disabled = false;
    state.isLoading = false;
  }
}

function handleCustomItemAdd() {
  const input = document.getElementById('customInput');
  if (!input) return;
  const val = input.value.trim();
  if (val) {
    state.addCustomItem(val);
    input.value = '';
  }
}

// ==========================================
// 6. 現代化 Toast 提示模組
// ==========================================
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px;";
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgColors = { info: '#1e90ff', warning: '#ffa502', error: '#ff4757' };
  
  toast.style.cssText = `padding: 10px 18px; border-radius: 8px; color: #fff; background: ${bgColors[type] || '#333'}; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3); opacity: 0; transform: translateY(-10px); transition: all 0.3s ease;`;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================
// 7. 啟動入口與自適應監聽
// ==========================================
function initApp() {
  setupEventListeners();
  UIRenderer.init();
  initWheelResizeObserver(() => state.currentItems);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
