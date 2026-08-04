import { setLanguage, updateUI, t } from './i18n.js';
import { getHKOStatus } from './api/hko.js';
import { getKmbETA } from './api/kmb.js';
import { Wheel } from './wheel.js';

const defaultRestaurants = [
  { 
    name: '室內車仔麵', 
    indoor: true, 
    walkMins: 4, 
    footbridge: true, 
    nearestMtr: '觀塘站 B2 出口',
    kmbStopId: 'B5069B569300D', 
    kmbRoute: '1A' 
  },
  { 
    name: '露天煲仔飯', 
    indoor: false, 
    walkMins: 8, 
    footbridge: false,
    nearestMtr: '牛頭角站 A 出口'
  },
  { 
    name: '連鎖快餐', 
    indoor: true, 
    walkMins: 3, 
    footbridge: true, 
    nearestMtr: '觀塘站 A1 出口'
  },
  { 
    name: '冰室茶餐廳', 
    indoor: true, 
    walkMins: 5, 
    footbridge: false,
    nearestMtr: '觀塘站 D4 出口'
  },
  { 
    name: '日式定食', 
    indoor: true, 
    walkMins: 6, 
    footbridge: true, 
    nearestMtr: '觀塘站 B1 出口'
  },
  { 
    name: '生滾海鮮粥', 
    indoor: false, 
    walkMins: 7, 
    footbridge: false,
    nearestMtr: '牛頭角站 B6 出口'
  }
];

async function init() {
  updateUI();

  const wheel = new Wheel('wheelCanvas', defaultRestaurants);

  document.getElementById('btnLangZh')?.addEventListener('click', () => {
    setLanguage('zh');
    updateUI();
  });
  document.getElementById('btnLangEn')?.addEventListener('click', () => {
    setLanguage('en');
    updateUI();
  });

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

  wheel.setItems(activeList);

  const spinBtn = document.getElementById('spinBtn');
  const resultBox = document.getElementById('resultBox');

  spinBtn?.addEventListener('click', () => {
    spinBtn.disabled = true;
    if (resultBox) resultBox.innerText = "...";

    wheel.spin(async (selected) => {
      spinBtn.disabled = false;
      if (!resultBox) return;

      let html = `<div style="margin-bottom:8px;">${t('resultPrefix')} <strong>${selected.name}</strong></div>`;
      
      const coverText = selected.footbridge ? '☂️ 全程天橋/免遮' : '🚶 室外步行';
      html += `<div class="transit-info">
                <p>⏱️ 步行時間：約 ${selected.walkMins} 分鐘 (${coverText})</p>
                <p>🚇 最近港鐵：${selected.nearestMtr}</p>`;

      if (selected.kmbStopId && selected.kmbRoute) {
        const eta = await getKmbETA(selected.kmbStopId, selected.kmbRoute);
        if (eta.success) {
          html += `<p>🚌 九巴 ${eta.route}：下一班 <strong>${eta.minutesLeft} 分鐘</strong>後到站</p>`;
        }
      }

      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.name)}`;
      html += `<a href="${mapUrl}" target="_blank" class="nav-btn">🗺️ 打開地圖導航</a></div>`;

      resultBox.innerHTML = html;
    });
  });
}

init();
