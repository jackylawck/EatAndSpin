import { APP_CONFIG } from './config.js';

const translations = {
  zh: {
    appTitle: "食一轉 · Eat & Spin",
    loadingStatus: "正在感應環境數據 (天氣 / 交通)...",
    spinBtn: "食一轉！",
    rainWarning: "🌧️ 檢測到降雨，已自動過濾露天餐廳",
    hotWarning: "☀️ 天氣酷熱，優先推薦室內冷氣餐廳",
    normalStatus: "🌤️ 天氣良好，所有餐廳皆可選擇",
    resultPrefix: "今日中午就食："
  },
  en: {
    appTitle: "Eat & Spin",
    loadingStatus: "Fetching environmental data (Weather / Transit)...",
    spinBtn: "Spin Now!",
    rainWarning: "🌧️ Rain detected. Outdoor spots filtered.",
    hotWarning: "☀️ High temperatures! Indoor dining prioritized.",
    normalStatus: "🌤️ Weather looks good! All options available.",
    resultPrefix: "Today's Lunch Choice:"
  }
};

let currentLang = localStorage.getItem(APP_CONFIG.STORAGE_KEY_LANG) || APP_CONFIG.DEFAULT_LANG;

export function t(key) {
  return translations[currentLang]?.[key] || key;
}

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem(APP_CONFIG.STORAGE_KEY_LANG, lang);
    updateUI();
  }
}

export function updateUI() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) el.innerText = t(key);
  });
}
