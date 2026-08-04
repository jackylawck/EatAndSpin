// js/main.js
import { setLanguage, updateUI, t } from './i18n.js';
import { getHKOStatus } from './api/hko.js';
import { Wheel } from './wheel.js';

const defaultRestaurants = [
  { name: '室內車仔麵', indoor: true },
  { name: '露天煲仔飯', indoor: false },
  { name: '連鎖快餐', indoor: true },
  { name: '冰室茶餐廳', indoor: true },
  { name: '日式定食', indoor: true },
  { name: '生滾海鮮粥', indoor: false }
];

async function init() {
  updateUI();

  // 1. 初始化彩色輪盤
  const wheel = new Wheel('wheelCanvas', defaultRestaurants);

  // 語言按鈕綁定
  document.getElementById('btnLangZh')?.addEventListener('click', () => {
    setLanguage('zh');
    updateUI();
  });
  document.getElementById('btnLangEn')?.addEventListener('click', () => {
    setLanguage('en');
    updateUI();
  });

  // 2. 獲取天氣數據並更新輪盤選項
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

  // 更新輪盤選項為過濾後的列表
  wheel.setItems(activeList);

  // 3. 點擊「食一轉！」觸發旋轉動畫
  const spinBtn = document.getElementById('spinBtn');
  const resultBox = document.getElementById('resultBox');

  spinBtn?.addEventListener('click', () => {
    spinBtn.disabled = true;
    if (resultBox) resultBox.innerText = "...";

    wheel.spin((selected) => {
      spinBtn.disabled = false;
      if (resultBox) {
        resultBox.innerText = `${t('resultPrefix')} ${selected.name}`;
      }
    });
  });
}

init();
