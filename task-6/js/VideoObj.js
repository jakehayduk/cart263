class VideoObj {
  constructor(x, y, w, h, videoElement, context, mx, my) {
    this.videoElement = videoElement;
    this.context = context;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.shapeX = 10;
    this.shapeY =10;
    this.shapeCol = "#000000";
    this.mx = mx;
    this.my = my;
 

    let filterButton_blur = document.getElementById("filter_button_blur");
    let filterButton_sepia = document.getElementById("filter_button_sepia");
    let filterButton_hue = document.getElementById("filter_button_hue");
    let filterButton_invert = document.getElementById("filter_button_invert");
    let blurInput = document.getElementById("blurnum");
    let sepiaInput = document.getElementById("sepianum");
    let hueInput = document.getElementById("huenum");
    let invertInput = document.getElementById("invertnum");
    this.userProvidedBlur  = 0;
    this.userProvidedSepia  = 0;
    this.userProvidedHue  = 0;
    this.userProvidedInvert  = 0;
    let self = this;

    filterButton_blur.addEventListener("click", function () {
      //get value from input field
      self.userProvidedBlur = blurInput.value;
    });
    filterButton_sepia.addEventListener("click", function () {
      //get value from input field
      self.userProvidedSepia = sepiaInput.value;
    });
    filterButton_hue.addEventListener("click", function () {
      //get value from input field
      self.userProvidedHue = hueInput.value;
    });
    filterButton_invert.addEventListener("click", function () {
      //get value from input field
      self.userProvidedInvert = invertInput.value;
    });
  }

  display() {
    this.context.save();
    this.context.filter = `blur(${this.userProvidedBlur}px) sepia(${this.userProvidedSepia}%) hue-rotate(${this.userProvidedHue}deg) invert(${this.userProvidedInvert}%)`;
    this.context.drawImage(this.videoElement, this.x, this.y, this.w, this.h);
    this.context.fillStyle = this.shapeCol;
    this.context.fillRect(this.shapeX, this.shapeY, 50, 50);
    this.context.restore();
  }

    //called when rectangle color is to be updated
  changeColor(newCol){
   this.shapeCol = newCol;
  }
  //called when rectangle Pos is to be updated
  updatePositionRect(mx,my){
     this.shapeX = mx - 25;
     this.shapeY = my - 25;
  }
  update(videoElement) {
    this.videoElement = videoElement;
  }
}
