class FreeStyleObj {
    constructor(x, y, length, f_color, s_color,context) {
      // We write instructions to set up a Flower here
      // Position and size information
      this.x = x;
      this.y = y;
      this.fill_color = f_color;
      this.stroke_color = s_color;
      this.theta = 0;
      this.length = length;
      this.yOffset = 20;
      this.angularSpeed = .07;
      this.context =context;

    }
  
    display() {
      this.theta =0; //reset everytime
      this.context.fillStyle = this.fill_color; // change the color we are using
      this.context.strokeStyle = this.stroke_color; // change the color we are using
      this.context.beginPath();
      this.context.moveTo(this.x,this.y)
      for(let i =this.x; i< this.x+this.length; i++){
      this.context.lineTo(i,(Math.sin(this.theta)*5)+this.y)
      this.context.lineTo(i,(Math.sin(this.theta)*5)+this.y+this.yOffset)
      this.theta+=this.angularSpeed;
      }
      this.context.stroke(); //set the stroke
    }

    update(volume) {
    // 1. Oscillate: Change the angular speed or amplitude based on volume
    // High volume makes the wave "wiggle" faster
    this.angularSpeed = 0.05 + (volume * 0.001);
    
    // 2. Change Color: Use volume to affect the stroke color
    let greenVal = Math.min(255, volume * 2);
    this.stroke_color = `rgb(207, ${greenVal}, 255)`;

    // 3. Arbitrary Animation: Vertical drifting
    this.yOffset = 20 + Math.sin(Date.now() * 0.001) * 10;
}
  }
  