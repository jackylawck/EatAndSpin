// js/main.js
import { setLanguage, updateUI, t } from './i18n.js';
import { getHKOStatus } from './api/hko.js';
import { getKmbETA } from './api/kmb.js';
import { fetchNearbyPlaces } from './api/nearby.js';
import { Wheel } from './wheel.js';

// 未開啟 GPS 時的預設示範清單（各 1 票）
let restaurants = [
  { name: '美心快餐', votes: 1, indoor: true },
  { name: '大家樂', votes: 1, indoor: true },
  { name: '肯德基 KFC', votes: 1, indoor: true },
  { name: '麥當勞', votes: 1, indoor: true },
  { name: '太興燒味', votes: 1, indoor: true },
  { name: '潭仔三哥', votes: 1, indoor: true }
];

let wheel = null;

// 動態繪製選單與加減票按鈕 (+1 / -1)
function renderItemList() {
  const listEl = document.getElementById('itemList');
  if (!listEl) return;

  listEl.innerHTML = '';
  restaurants.forEach((item, index) => {
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

  // 自動同步更新輪盤上的扇形與比例
  if (wheel) wheel.setItems(restaurants);
}

async function init() {
  updateUI();
  wheel = new Wheel('wheelCanvas', restaurants);
  renderItemList();

  // 1. 多語言切換按鈕
  document.getElementById('btnLangZh')?.addEventListener('click', () => { setLanguage('zh'); updateUI(); });
  document.getElementById('btnLangEn')?.addEventListener('click', () => { setLanguage('en'); updateUI(); });

  // 2. 免費免 Key：GPS 定位並調用 Overpass API 拉取周邊 12 間真實餐廳
  document.getElementById('btnGeo')?.addEventListener('click', () => {
    const locText = document.getElementById('locationText');
    if (!navigator.geolocation) {
      alert("你的瀏覽器不支援 GPS 定位");
      return;
    }

    if (locText) locText.innerText = "📍 正在搜尋周邊 12 間真實餐廳...";

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // 調用 nearby.js 獲取免費 OpenStreetMap 餐廳數據
        const nearby = await fetchNearbyPlaces(lat, lng);
        if (nearby.length > 0) {
          restaurants = nearby; // 載入 12 間真實餐廳（預設各 1 票）
          renderItemList();
          if (locText) locText.innerText = `📍 定位成功！已載入周邊 ${nearby.length} 間真實餐廳`;
        } else {
          if (locText) locText.innerText = "📍 附近未找到餐廳數據，可手動新增選項";
        }
      },
      (err) => {
        if (locText) locText.innerText = "📍 定位失敗 (請開啟 GPS 存取權限)";
      }
    );
  });

  // 3. 手動新增自訂餐廳（預設 1 票）
  document.getElementById('btnAddItem')?.addEventListener('click', () => {
    const input = document.getElementById('customInput');
    const name = input.value.trim();
    if (name) {
      restaurants.push({ name: name, votes: 1, indoor: true });
      input.value = '';
      renderItemList();
    }
  });

  // 4. 團隊加權投票 (+1 / -1)
  document.getElementById('itemList')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.vote-btn');
    if (!btn) return;

    const index = parseInt(btn.dataset.index);
    const action = btn.dataset.action;

    if (action === 'plus') {
      restaurants[index].votes += 1;
    } else if (action === 'minus') {
      restaurants[index].votes -= 1;
      if (restaurants[index].votes <= 0) {
        restaurants.splice(index, 1); // 0 票時自動刪除
      }
    }
    renderItemList();
  });

  // 5. 食一轉！動態旋轉與結果展示
  const spinBtn = document.getElementById('spinBtn');
  const resultBox = document.getElementById('resultBox');

  spinBtn?.addEventListener('click', () => {
    if (restaurants.length === 0) {
      alert("請先新增或搜尋至少一間餐廳！");
      return;
    }
    spinBtn.disabled = true;
    if (resultBox) resultBox.innerText = "...";

    wheel.spin(async (selected) => {
      spinBtn.disabled = false;
      if (!resultBox) return;

      let html = `<div style="margin-bottom:8px;">${t('resultPrefix')} <strong>${selected.name}</strong> (${selected.votes} 票中選！)</div>`;
      
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.name)}`;
      html += `<a href="${mapUrl}" target="_blank" class="nav-btn">🗺️ 打開地圖導航與食評</a>`;

      resultBox.innerHTML = html;
    });
  });
}

init();
