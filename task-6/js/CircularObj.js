class CircularObj {
  constructor(x, y, radius, f_color, s_color, context) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.fill_color = f_color;
    this.stroke_color = s_color;
    this.startAngle = 0;
    this.endAngle = Math.PI * 2;
    this.context = context;

    // animation properties
    this.vx = (Math.random() * 2 - 1) * 2;
    this.vy = (Math.random() * 2 - 1) * 2;
  }

  display() {
    this.context.fillStyle = this.fill_color;
    this.context.strokeStyle = this.stroke_color;

    this.context.beginPath();
    this.context.arc(
      this.x,
      this.y,
      this.radius,
      this.startAngle,
      this.endAngle,
      true
    );
    this.context.fill();
    this.context.lineWidth = 2;
    this.context.closePath();
    this.context.stroke();
  }

  update() {
    // simple movement
    this.x += this.vx;
    this.y += this.vy;

    // bounce off canvas edges
    let canvas = this.context.canvas;

    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
      this.vx *= -1;
    }

    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
      this.vy *= -1;
    }
  }
}