// ==========================================
// 1. 雙語字典定義 (可無痛持續擴充)
// ==========================================
const translations = {
  zh: {
    appTitle: '食一轉 · Eat & Spin',
    tabRestaurant: '🏪 搵餐廳 Mode',
    tabSetMenu: '🍱 揀 ABCD 餐 Mode',
    privacyBar: '🔒 <strong>隱私聲明：</strong> 本地運算，絕不上傳或儲存個人位置。',
    locationPlaceholder: '輸入地點 (例: 觀塘 / 中環 / 灣仔)',
    btnSearchLoc: '搜尋地點',
    filterTitle: '🎯 預先篩選類別：',
    filterNoCafe: '🚫 剔除 Cafe/咖啡店',
    filterChinese: '🥢 中菜/點心',
    filterJapanese: '🍣 日韓料理',
    filterAsian: '🍜 東南亞/粉麵',
    filterWestern: '🍕 西式/披薩',
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
    resultPrefix: '🎉 今日食：',
    btnOpenRice: '🔍 喺 OpenRice 睇食評 / 菜單',
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
    filterNoCafe: '🚫 Exclude Cafes',
    filterChinese: '🥢 Chinese / Dim Sum',
    filterJapanese: '🍣 Japanese / Korean',
    filterAsian: '🍜 Asian / Noodles',
    filterWestern: '🍕 Western / Pizza',
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
    resultPrefix: "🎉 Today's Pick: ",
    btnOpenRice: '🔍 View on OpenRice',
    defaultMenu: [
      { name: 'Set A: Stir-fried Beef Noodles', votes: 1 },
      { name: 'Set B: Baked Pork Chop Rice', votes: 1 },
      { name: 'Set C: Luncheon Meat & Egg Rice', votes: 1 },
      { name: 'Set D: Wonton Noodles', votes: 1 }
    ]
  }
};

const STORAGE_KEY_LANG = 'eat_spin_lang';
let currentLang = 'zh';

// 嘗試從 localStorage 讀取語系 (容錯保護)
try {
  const savedLang = localStorage.getItem(STORAGE_KEY_LANG);
  if (savedLang && translations[savedLang]) {
    currentLang = savedLang;
  }
} catch (e) {
  console.warn('localStorage access denied for i18n:', e);
}

// ==========================================
// 2. 核心 API
// ==========================================
export function getLang() {
  return currentLang;
}

export function t(key, defaultValue = key) {
  const res = translations[currentLang]?.[key];
  return res !== undefined ? res : defaultValue;
}

export function getTranslationObject(key) {
  return translations[currentLang]?.[key];
}

export function setLanguage(lang) {
  if (!translations[lang] || lang === currentLang) return;
  currentLang = lang;

  try {
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  } catch (e) {
    // 忽略隱私模式下的儲存失敗
  }

  // 同步 HTML 根標籤語言屬性
  document.documentElement.lang = currentLang === 'zh' ? 'zh-HK' : 'en';

  updateDOMTranslations();

  // 廣播自訂事件，讓 main.js 與其他模組主動響應
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
}

// ==========================================
// 3. 自動更新 DOM 文本與屬性
// ==========================================
export function updateDOMTranslations() {
  // 1. 一般文字節點 (textContent / innerHTML)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else if (typeof val === 'string' && val.includes('<')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    }
  });

  // 2. 屬性翻譯 (支援 data-i18n-attr="placeholder:key1,aria-label:key2")
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const attrMap = el.getAttribute('data-i18n-attr');
    if (!attrMap) return;
    attrMap.split(',').forEach(pair => {
      const [attr, key] = pair.split(':').map(s => s.trim());
      if (attr && key) {
        const val = t(key);
        if (val !== undefined) el.setAttribute(attr, val);
      }
    });
  });

  // 3. 語言按鈕狀態與 A11y
  const btnZh = document.getElementById('btnLangZh');
  const btnEn = document.getElementById('btnLangEn');
  btnZh?.classList.toggle('active', currentLang === 'zh');
  btnZh?.setAttribute('aria-pressed', currentLang === 'zh' ? 'true' : 'false');
  btnEn?.classList.toggle('active', currentLang === 'en');
  btnEn?.setAttribute('aria-pressed', currentLang === 'en' ? 'true' : 'false');
}

export function initI18n() {
  document.documentElement.lang = currentLang === 'zh' ? 'zh-HK' : 'en';
  updateDOMTranslations();
}

// 模組載入時自動初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}
