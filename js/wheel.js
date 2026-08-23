// ==========================================
// 1. 常數與全域設定 (Constants & Configurations)
// ==========================================
const POINTER_ANGLE = 1.5 * Math.PI; // 指針固定於正上方 12 點鐘方向 (270deg / -90deg)
let currentAngle = 0;
let isSpinning = false;

// HSL 動態配色：保證任意數量選項均能均勻分佈且相鄰不撞色
function getSliceColor(index, total) {
  if (total <= 1) return 'hsl(210, 80%, 55%)';
  const hue = Math.round((index * 360) / total);
  return `hsl(${hue}, 75%, 55%)`;
}

// 防呆解析項目名稱
function getItemName(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item.name === 'string') return item.name;
  if (item.displayName?.text) return item.displayName.text;
  return String(item);
}

// ==========================================
// 2. 輪盤繪製引擎 (Canvas Wheel Renderer)
// ==========================================
export function drawWheel(items = []) {
  const canvas = document.getElementById('wheelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // 取得 CSS 邏輯寬高與設備像素比 (處理 Retina 高清螢幕)
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const displaySize = Math.floor(rect.width) || 300;

  if (canvas.width !== displaySize * dpr || canvas.height !== displaySize * dpr) {
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  const width = displaySize;
  const height = displaySize;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 10;

  ctx.clearRect(0, 0, width, height);

  // 空選項狀態繪製
  if (!Array.isArray(items) || items.length === 0) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#475569';
    ctx.stroke();
    ctx.restore();
    return;
  }

  const totalVotes = items.reduce((sum, item) => sum + Math.max(1, (typeof item === 'object' && item.votes) || 1), 0);
  if (totalVotes <= 0) {
    ctx.restore();
    return;
  }

  let startAngle = currentAngle;
  const totalItems = items.length;
  const fontSize = Math.max(11, Math.min(14, Math.round(radius / 12)));

  items.forEach((item, i) => {
    const votes = Math.max(1, (typeof item === 'object' && item.votes) || 1);
    const sliceAngle = (2 * Math.PI * votes) / totalVotes;
    const endAngle = startAngle + sliceAngle;
    const midAngle = startAngle + sliceAngle / 2;

    // 1. 繪製扇形
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = getSliceColor(i, totalItems);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    // 2. 智慧文字繪製 (自動翻轉防倒字)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(midAngle);

    const normalizedMid = (midAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const isLeftSide = normalizedMid > 0.5 * Math.PI && normalizedMid < 1.5 * Math.PI;

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;

    const itemName = getItemName(item);
    const maxChars = Math.max(6, Math.floor(radius / 18));
    const label = itemName.length > maxChars ? `${itemName.substring(0, maxChars - 1)}...` : itemName;

    if (isLeftSide) {
      ctx.rotate(Math.PI);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, -(radius - 15), 0);
    } else {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, radius - 15, 0);
    }

    ctx.restore();
    startAngle = endAngle;
  });

  // 3. 中心圓鈕
  ctx.beginPath();
  ctx.arc(centerX, centerY, Math.max(18, radius * 0.15), 0, 2 * Math.PI);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.restore();
}

// ==========================================
// 3. 轉盤旋轉動畫 (Spin Animation)
// ==========================================
export function spinWheel(items = [], lang = 'zh') {
  if (isSpinning || !Array.isArray(items) || items.length === 0) return;

  const totalVotes = items.reduce((sum, item) => sum + Math.max(1, (typeof item === 'object' && item.votes) || 1), 0);
  if (totalVotes <= 0) return;

  isSpinning = true;

  const randomAdditionalDeg = Math.floor(Math.random() * 360) + 1800;
  const startAngleDeg = (currentAngle * 180) / Math.PI;
  const duration = 3800;
  let startTime = null;

  function animate(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeOut = 1 - Math.pow(1 - progress, 4);
    const currentDeg = startAngleDeg + randomAdditionalDeg * easeOut;

    currentAngle = (currentDeg * Math.PI) / 180;
    drawWheel(items);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      calculateResult(items, totalVotes, lang);
    }
  }

  requestAnimationFrame(animate);
}

// ==========================================
// 4. 結果計算與安全 DOM 渲染 (XSS-Safe Result)
// ==========================================
function calculateResult(items, totalVotes, lang = 'zh') {
  let relativeAngle = (POINTER_ANGLE - (currentAngle % (2 * Math.PI))) % (2 * Math.PI);
  if (relativeAngle < 0) relativeAngle += 2 * Math.PI;

  let accumulatedAngle = 0;
  for (const item of items) {
    const votes = Math.max(1, (typeof item === 'object' && item.votes) || 1);
    const sliceAngle = (2 * Math.PI * votes) / totalVotes;

    if (relativeAngle >= accumulatedAngle && relativeAngle < accumulatedAngle + sliceAngle) {
      renderResultBox(getItemName(item), lang);
      break;
    }
    accumulatedAngle += sliceAngle;
  }
}

function renderResultBox(winnerName, lang) {
  const resultBox = document.getElementById('resultBox');
  if (!resultBox) return;

  resultBox.replaceChildren();

  const titleDiv = document.createElement('div');
  titleDiv.style.cssText = 'font-size: 1.15rem; font-weight: bold; margin-bottom: 8px; color: #ffffff;';
  
  const prefix = lang === 'en' ? "🎉 Today's Pick: " : '🎉 今日食：';
  const nameSpan = document.createElement('span');
  nameSpan.style.color = '#ffb900';
  nameSpan.textContent = winnerName;

  titleDiv.append(prefix, nameSpan, '！');

  const openRiceUrl = `https://www.openrice.com/zh/hongkong/restaurants?where=${encodeURIComponent(winnerName)}`;
  const linkBtn = document.createElement('a');
  linkBtn.href = openRiceUrl;
  linkBtn.target = '_blank';
  linkBtn.rel = 'noopener noreferrer';
  linkBtn.textContent = lang === 'en' ? '🔍 View on OpenRice' : '🔍 喺 OpenRice 睇食評 / 菜單';
  linkBtn.style.cssText = 'display: inline-block; padding: 7px 16px; background-color: #ffb900; color: #1e1e1e; font-size: 0.85rem; font-weight: bold; border-radius: 20px; text-decoration: none; box-shadow: 0 3px 8px rgba(0,0,0,0.25); transition: transform 0.2s ease;';

  resultBox.append(titleDiv, linkBtn);
  resultBox.style.display = 'block';
  resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ==========================================
// 5. 響應式自動適配 (ResizeObserver)
// ==========================================
export function initWheelResizeObserver(itemsGetter) {
  const canvas = document.getElementById('wheelCanvas');
  if (!canvas || !canvas.parentElement || typeof ResizeObserver === 'undefined') return;

  const ro = new ResizeObserver(() => {
    if (!isSpinning) {
      const items = typeof itemsGetter === 'function' ? itemsGetter() : [];
      drawWheel(items);
    }
  });

  ro.observe(canvas.parentElement);
}
