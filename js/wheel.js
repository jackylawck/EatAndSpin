// 輪盤顏色盤
const colors = [
  '#ff4757', '#2ed573', '#1e90ff', '#ffa502', 
  '#ff6b81', '#70a1ff', '#eccc68', '#7bed9f',
  '#ff7f50', '#a4b0be', '#9b59b6', '#34495e'
];

let currentAngle = 0;
let isSpinning = false;

// 繪製輪盤
export function drawWheel(items = []) {
  const canvas = document.getElementById('wheelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width / 2 - 10;

  ctx.clearRect(0, 0, width, height);

  if (!items || items.length === 0) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.stroke();
    return;
  }

  const totalVotes = items.reduce((sum, item) => sum + (item.votes || 1), 0);
  let startAngle = currentAngle;

  items.forEach((item, i) => {
    const sliceAngle = (2 * Math.PI * (item.votes || 1)) / totalVotes;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    
    const label = item.name.length > 10 ? item.name.substring(0, 9) + '...' : item.name;
    ctx.fillText(label, radius - 15, 5);
    ctx.restore();

    startAngle = endAngle;
  });

  ctx.beginPath();
  ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
}

// 轉動輪盤動畫 (傳入 lang 參數)
export function spinWheel(items = [], lang = 'zh') {
  if (isSpinning || items.length === 0) return;
  isSpinning = true;

  const totalVotes = items.reduce((sum, item) => sum + (item.votes || 1), 0);
  const randomRotation = Math.floor(Math.random() * 360) + 1440;
  const startAngleDegree = (currentAngle * 180) / Math.PI;

  let start = null;
  const duration = 4000;

  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentDeg = startAngleDegree + (randomRotation * easeOut);
    
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

// 計算中獎結果 (加入 OpenRice 快速搜尋連結)
function calculateResult(items, totalVotes, lang = 'zh') {
  let normalizedAngle = (1.5 * Math.PI - (currentAngle % (2 * Math.PI))) % (2 * Math.PI);
  if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

  let accumulatedAngle = 0;
  for (let item of items) {
    const sliceAngle = (2 * Math.PI * (item.votes || 1)) / totalVotes;
    if (normalizedAngle >= accumulatedAngle && normalizedAngle < accumulatedAngle + sliceAngle) {
      const resultBox = document.getElementById('resultBox');
      if (resultBox) {
        // 動態產生 OpenRice 搜尋網址
        const openRiceUrl = `https://www.openrice.com/zh/hongkong/restaurants?where=${encodeURIComponent(item.name)}`;
        
        const prefix = lang === 'en' ? "🎉 Today's Choice: " : "🎉 今日食：";
        const btnText = lang === 'en' ? "🔍 View on OpenRice" : "🔍 喺 OpenRice 睇食評 / 菜單";

        resultBox.innerHTML = `
          <div style="font-size: 1.1rem; margin-bottom: 8px;">
            ${prefix}<strong>${item.name}</strong>！
          </div>
          <a href="${openRiceUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 6px 14px; background-color: #ffb900; color: #1e1e1e; font-size: 0.85rem; font-weight: bold; border-radius: 20px; text-decoration: none; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
            ${btnText}
          </a>
        `;
        resultBox.style.display = 'block';
      }
      break;
    }
    accumulatedAngle += sliceAngle;
  }
}
