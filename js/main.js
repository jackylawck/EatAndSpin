// js/main.js
import { setLanguage, updateUI, t } from './i18n.js';
import { fetchNearbyPlaces, fetchPlacesByAddress } from './api/nearby.js';
import { Wheel } from './wheel.js';

// 1. 預設餐廳清單
const defaultRestaurants = [
  { name: '美心快餐', votes: 1, indoor: true },
  { name: '大家樂', votes: 1, indoor: true },
  { name: '肯德基 KFC', votes: 1, indoor: true },
  { name: '麥當勞', votes: 1, indoor: true },
  { name: '太興燒味', votes: 1, indoor: true },
  { name: '潭仔三哥', votes: 1, indoor: true }
];

// 2. 預設 A/B/C/D/E 餐牌清單
const defaultSetMenu = [
  { name: 'A餐：干炒牛河', votes: 1 },
  { name: 'B餐：星洲炒米', votes: 1 },
  { name: 'C餐：餐肉煎蛋飯', votes: 1 },
  { name: 'D餐：焗豬扒飯', votes: 1 },
  { name: 'E餐：吉列豬扒烏冬', votes: 1 }
];

let currentMode = 'restaurant'; // 'restaurant' 或 'setMenu'
let currentItems = [...defaultRestaurants];
let wheel = null;

function renderItemList() {
  const listEl = document.getElementById('itemList');
  if (!listEl) return;

  listEl.innerHTML = '';
  currentItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'item-row';
    li.innerHTML = `
      <span class="restaurant-name">${item.name}</span>
      <div class="vote-controls">
        <button class="vote-btn" data-action="minus" data-index="${index}">-</button>
        <span class="vote-count">${item.votes} 票</span>
        <button class="vote-btn" data-action="plus" data-index="${index}">+</button>
      </div>
    `;
    listEl.appendChild(li);
  });

  if (wheel) wheel.setItems(currentItems);
}

async function init() {
  updateUI();
  wheel = new Wheel('wheelCanvas', currentItems);
  renderItemList();

  // 語言按鈕
  document.getElementById('btnLangZh')?.addEventListener('click', () => { setLanguage('zh'); updateUI(); });
  document.getElementById('btnLangEn')?.addEventListener('click', () => { setLanguage('en'); updateUI(); });

  // Mode 切換 (搵餐廳 vs 揀 ABCD 餐)
  const tabRest = document.getElementById('tabRestaurant');
  const tabSet = document.getElementById('tabSetMenu');
  const locSearchBox = document.getElementById('locationSearchBox');
  const secTitle = document.getElementById('sectionTitle');

  tabRest?.addEventListener('click', () => {
    currentMode = 'restaurant';
    tabRest.classList.add('active');
    tabSet.classList.remove('active');
    if (locSearchBox) locSearchBox.style.display = 'block';
    if (secTitle) secTitle.innerText = '🗳️ 餐廳選單與加權投票 (預設各 1 票)';
    currentItems = [...defaultRestaurants];
    renderItemList();
  });

  tabSet?.addEventListener('click', () => {
    currentMode = 'setMenu';
    tabSet.classList.add('active');
    tabRest.classList.remove('active');
    if (locSearchBox) locSearchBox.style.display = 'none'; // 隱藏地點搜尋列
    if (secTitle) secTitle.innerText = '🍱 餐牌選項與加權投票 (預設各 1 票)';
    currentItems = [...defaultSetMenu];
    renderItemList();
  });

  // 自訂地點搜尋 (例: 輸入觀塘/灣仔)
  document.getElementById('btnSearchLoc')?.addEventListener('click', async () => {
    const input = document.getElementById('locationInput');
    const locName = input?.value.trim();
    if (!locName) return;

    const btn = document.getElementById('btnSearchLoc');
    if (btn) btn.innerText = '搜尋中...';

    const results = await fetchPlacesByAddress(locName);
    if (btn) btn.innerText = '搜尋地點';

    if (results.length > 0) {
      currentItems = results;
      renderItemList();
      alert(`已成功載入 [${locName}] 附近 ${results.length} 間真實餐廳！`);
    } else {
      alert(`找不到 [${locName}] 附近的餐廳資料，請嘗試其他地點名稱`);
    }
  });

  // GPS 本地搜尋
  document.getElementById('btnGeo')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert("你的瀏覽器不支援 GPS 定位");
      return;
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const results = await fetchNearbyPlaces(pos.coords.latitude, pos.coords.longitude);
      if (results.length > 0) {
        currentItems = results;
        renderItemList();
      }
    });
  });

  // 手動新增選項
  document.getElementById('btnAddItem')?.addEventListener('click', () => {
    const input = document.getElementById('customInput');
    const val = input.value.trim();
    if (val) {
      currentItems.push({ name: val, votes: 1 });
      input.value = '';
      renderItemList();
    }
  });

  // 加減票投票 (+1 / -1)
  document.getElementById('itemList')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.vote-btn');
    if (!btn) return;

    const index = parseInt(btn.dataset.index);
    const action = btn.dataset.action;

    if (action === 'plus') {
      currentItems[index].votes += 1;
    } else if (action === 'minus') {
      currentItems[index].votes -= 1;
      if (currentItems[index].votes <= 0) {
        currentItems.splice(index, 1);
      }
    }
    renderItemList();
  });

  // 食一轉！
  const spinBtn = document.getElementById('spinBtn');
  const resultBox = document.getElementById('resultBox');

  spinBtn?.addEventListener('click', () => {
    if (currentItems.length === 0) {
      alert("請先新增或搜尋選項！");
      return;
    }
    spinBtn.disabled = true;
    if (resultBox) resultBox.innerText = "...";

    wheel.spin((selected) => {
      spinBtn.disabled = false;
      if (!resultBox) return;

      if (currentMode === 'restaurant') {
        let html = `<div style="margin-bottom:8px;">${t('resultPrefix')} <strong>${selected.name}</strong></div>`;
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.name)}`;
        html += `<a href="${mapUrl}" target="_blank" class="nav-btn">🗺️ 打開地圖導航與食評</a>`;
        resultBox.innerHTML = html;
      } else {
        resultBox.innerHTML = `🏆 今日揀中：<strong>${selected.name}</strong>！祝你用餐愉快！`;
      }
    });
  });
}

init();
