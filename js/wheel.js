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
    if (this.items.length === 0) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 10;

    const totalVotes = this.items.reduce((sum, item) => sum + (item.votes || 1), 0);

    this.ctx.clearRect(0, 0, width, height);

    let startAngle = this.currentAngle;

    this.items.forEach((item, index) => {
      const votes = item.votes || 1;
      const sliceAngle = (votes / totalVotes) * (2 * Math.PI);

      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      this.ctx.fillStyle = COLORS[index % COLORS.length];
      this.ctx.fill();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#1e293b';
      this.ctx.stroke();

      this.ctx.save();
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate(startAngle + sliceAngle / 2);
      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 13px -apple-system, sans-serif';
      this.ctx.fillText(`${item.name} (${votes}票)`, radius - 15, 5);
      this.ctx.restore();

      startAngle += sliceAngle;
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

        const totalVotes = this.items.reduce((sum, item) => sum + (item.votes || 1), 0);
        const normalizedAngle = (1.5 * Math.PI - (this.currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        let currentAccumAngle = 0;
        let selectedItem = this.items[0];

        for (let item of this.items) {
          const sliceAngle = ((item.votes || 1) / totalVotes) * (2 * Math.PI);
          if (normalizedAngle >= currentAccumAngle && normalizedAngle < currentAccumAngle + sliceAngle) {
            selectedItem = item;
            break;
          }
          currentAccumAngle += sliceAngle;
        }

        if (onComplete) onComplete(selectedItem);
      }
    };

    requestAnimationFrame(animate);
  }
}
