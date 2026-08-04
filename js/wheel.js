// js/wheel.js

const COLORS = ['#ff4757', '#ffa502', '#2ed573', '#1e90ff', '#3742fa', '#70a1ff', '#eccc68'];

export class Wheel {
  constructor(canvasId, items = []) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.items = items;
    this.currentAngle = 0;
    this.isSpinning = false;
    this.draw();
  }

  // 更新選項名單並重繪
  setItems(newItems) {
    this.items = newItems;
    this.draw();
  }

  // 繪製圓盤
  draw() {
    const numItems = this.items.length;
    if (numItems === 0) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 10;
    const sliceAngle = (2 * Math.PI) / numItems;

    this.ctx.clearRect(0, 0, width, height);

    this.items.forEach((item, index) => {
      const angle = this.currentAngle + index * sliceAngle;

      // 畫扇形
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      this.ctx.fillStyle = COLORS[index % COLORS.length];
      this.ctx.fill();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#1e293b';
      this.ctx.stroke();

      // 畫文字
      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(angle + sliceAngle / 2);
      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 15px sans-serif';
      this.ctx.fillText(item.name, radius - 20, 5);
      this.ctx.restore();
    });

    // 畫中心軸圓圈
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fill();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();
  }

  // 轉動輪盤動畫
  spin(onComplete) {
    if (this.isSpinning || this.items.length === 0) return;

    this.isSpinning = true;
    const spinAngle = Math.PI * 2 * (5 + Math.random() * 5); // 旋轉 5~10 圈
    const duration = 4000; // 4 秒
    const startAngle = this.currentAngle;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out 減速效果
      const easeOut = 1 - Math.pow(1 - progress, 3);
      this.currentAngle = startAngle + spinAngle * easeOut;
      this.draw();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        // 計算指針指向的選項（頂點 270度 / 1.5PI 位置）
        const numItems = this.items.length;
        const sliceAngle = (2 * Math.PI) / numItems;
        const normalizedAngle = (1.5 * Math.PI - (this.currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const winningIndex = Math.floor(normalizedAngle / sliceAngle) % numItems;

        if (onComplete) onComplete(this.items[winningIndex]);
      }
    };

    requestAnimationFrame(animate);
  }
}
