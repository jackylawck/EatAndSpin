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

  setItems(newItems) {
    this.items = newItems;
    this.draw();
  }

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

      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      this.ctx.fillStyle = COLORS[index % COLORS.length];
      this.ctx.fill();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#1e293b';
      this.ctx.stroke();

      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(angle + sliceAngle / 2);
      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 14px -apple-system, sans-serif';
      this.ctx.fillText(item.name, radius - 15, 5);
      this.ctx.restore();
    });

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fill();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();
  }

  spin(onComplete) {
    if (this.isSpinning || this.items.length === 0) return;

    this.isSpinning = true;
    const spinAngle = Math.PI * 2 * (5 + Math.random() * 5);
    const duration = 4000;
    const startAngle = this.currentAngle;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      this.currentAngle = startAngle + spinAngle * easeOut;
      this.draw();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
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
