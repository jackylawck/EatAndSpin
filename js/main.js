// js/main.js
import { setLanguage, updateUI, t } from './i18n.js';
import { getHKOStatus } from './api/hko.js';

// 初始餐廳數據模型
const defaultRestaurants = [
  { name: '室內商場車仔麵', indoor: true },
  { name: '露天大排檔煲仔飯', indoor: false },
  { name: '連鎖冷氣快餐', indoor: true },
  { name: '冰室茶餐廳', indoor: true }
];

async function init() {
  // 1. 初始化多語言
  updateUI();
  
  // 綁定語言切換按鈕
  document.getElementById('btnLangZh')?.addEventListener('click', () => setLanguage('zh'));
  document.getElementById('btnLangEn')?.addEventListener('click', () => setLanguage('en'));

  // 2. 異步獲取天氣狀況
  const weather = await getHKOStatus();
  const noticeBar = document.getElementById('statusNotice');

  let activeList = defaultRestaurants;

  if (weather.isRaining) {
    if (noticeBar) noticeBar.innerText = t('rainWarning');
    activeList = defaultRestaurants.filter(r => r.indoor);
  } else if (weather.isVeryHot) {
    if (noticeBar) noticeBar.innerText = t('hotWarning');
  } else {
    if (noticeBar) noticeBar.innerText = t('normalStatus');
  }

  // 3. 綁定抽籤按鈕
  document.getElementById('spinBtn')?.addEventListener('click', () => {
    const picked = activeList[Math.floor(Math.random() * activeList.length)];
    const resultBox = document.getElementById('resultBox');
    if (resultBox) {
      resultBox.innerText = `${t('resultPrefix')} ${picked.name}`;
    }
  });
}

// 啟動 App
init();
