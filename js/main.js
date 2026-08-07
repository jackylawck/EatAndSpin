// 宣告全域資料池
let fetchedPool = [];   // 儲存 API 回傳的所有備用餐廳 (例如 30 間)
let currentItems = [];  // 輪盤目前顯示的餐廳 (預設 12 間)

// 渲染列表 (包含 ❌ 刪除按鈕)
function renderItemList() {
  const itemList = document.getElementById('itemList');
  const btnReplenish = document.getElementById('btnReplenish');
  itemList.innerHTML = '';

  currentItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'item-row';
    li.style.cssText = "display:flex; justify-between; align-items:center; margin-bottom:6px;";
    li.innerHTML = `
      <span>${item.name} (${item.votes || 1}票)</span>
      <div>
        <button onclick="adjustVote(${index}, 1)">+</button>
        <button onclick="adjustVote(${index}, -1)">-</button>
        <button style="background:none; border:none; cursor:pointer;" onclick="removeItem(${index})">❌</button>
      </div>
    `;
    itemList.appendChild(li);
  });

  // 如果輪盤少於 12 間且備用池還有貨，顯示「補抓」按鈕
  if (currentItems.length < 12 && fetchedPool.length > currentItems.length) {
    btnReplenish.style.display = 'block';
  } else {
    btnReplenish.style.display = 'none';
  }

  // 觸發輪盤重繪
  if (typeof drawWheel === 'function') drawWheel();
}

// 刪除指定項目
window.removeItem = function(index) {
  currentItems.splice(index, 1);
  renderItemList();
};

// 補抓附近其他餐廳至 12 間
document.getElementById('btnReplenish')?.addEventListener('click', () => {
  const needed = 12 - currentItems.length;
  if (needed <= 0) return;

  // 找出未在輪盤上的備用餐廳
  const unused = fetchedPool.filter(p => !currentItems.some(c => c.name === p.name));
  const additions = unused.slice(0, needed);

  if (additions.length > 0) {
    currentItems.push(...additions);
    renderItemList();
  } else {
    alert('附近暫無更多符合條件的餐廳了！');
  }
});
