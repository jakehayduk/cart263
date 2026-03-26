class RectangularObj {
  constructor(x, y, w, h, f_color, s_color, context) {
    // We write instructions to set up a Flower here
    // Position and size information
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.fill_color = f_color;
    this.stroke_color = s_color;
    this.startAngle = 0;
    this.endAngle = Math.PI * 2; //full rotation
    this.context = context;
  }

  display() {
    this.context.fillStyle = this.fill_color; // change the color we are using
    this.context.fillRect(this.x, this.y,this.width, this.height);
    this.context.strokeStyle = this.stroke_color; // change the color we are using
    this.context.lineWidth = 2; //change stroke
    this.context.strokeRect(this.x, this.y,this.width, this.height);
  }

  update(volume) {
    // 1. Change Scale: Use volume to affect width and height
    // We use a base size of 50 and add volume (0-255) scaled down
    this.width = 50 + (volume * 0.5);
    this.height = 70 + (volume * 0.5);

    // 2. Change Color: Shift the hue based on volume
    this.fill_color = `rgb(${100 + volume}, ${50 + volume/2}, 50)`;

    // 3. Arbitrary Animation: Horizontal oscillation
    this.x += Math.sin(Date.now() * 0.002) * 2;
}
}