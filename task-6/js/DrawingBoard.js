class DrawingBoard {
  /* Constructor */
  constructor(canvas, context,drawingBoardId) {
    this.canvas = canvas;
    this.context = context;
    this.objectsOnCanvas = [];
    let self = this;
    this.drawingBoardId = drawingBoardId;
    //each element has a mouse clicked and a mouse over
    this.canvas.addEventListener("click", function (e) {
      self.clickCanvas(e);
    });

    this.canvas.addEventListener("mousemove", function (e) {
      self.overCanvas(e);
    });
  }

  overCanvas(e) {
    //console.log("over");
    this.canvasBoundingRegion = this.canvas.getBoundingClientRect();
    this.mouseOffsetX = parseInt(e.clientX - this.canvasBoundingRegion.x);
    this.mouseOffsetY = parseInt(e.clientY - this.canvasBoundingRegion.y);
    //console.log(this.mouseOffsetX, this.mouseOffsetY);

    //differentiate which canvas
    //you can remove the console.logs /// 
    if(this.drawingBoardId ==="partA"){
      //console.log("in A")
    }
    if(this.drawingBoardId ==="partB"){
      //console.log("in B")
    }
    if(this.drawingBoardId ==="partC"){
      //console.log("in C")
    }
    if(this.drawingBoardId ==="partD"){
      //console.log("in D")
      this.objectsOnCanvas[0].updatePositionRect(this.mouseOffsetX, this.mouseOffsetY);
   }
  }

  clickCanvas(e) {
   // console.log("clicked");
    this.canvasBoundingRegion = this.canvas.getBoundingClientRect();
    this.mouseOffsetX = parseInt(e.clientX - this.canvasBoundingRegion.x);
    this.mouseOffsetY = parseInt(e.clientY - this.canvasBoundingRegion.y);
    //console.log(this.mouseOffsetX, this.mouseOffsetY);
     
    //differentiate which canvas
   //you can remove the console.logs /// 
     if(this.drawingBoardId ==="partA"){
      //console.log("in A")
      if (e.shiftKey) {
        let nearestIndex = -1;
        let nearestDist = Infinity;

        for (let i = 0; i < this.objectsOnCanvas.length; i++) {
          let obj = this.objectsOnCanvas[i];
          let dx = obj.x - this.mouseOffsetX;
          let dy = obj.y - this.mouseOffsetY;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < nearestDist) {
            nearestDist = dist;
            nearestIndex = i;
          }
        }

        // remove if close enough
        if (nearestIndex !== -1) {
          this.objectsOnCanvas.splice(nearestIndex, 1);
        }

      } else {
        // NORMAL CLICK = ADD NEW CIRCLE
        let radius = Math.random() * 20 + 10;

        let newCircle = new CircularObj(
          this.mouseOffsetX,
          this.mouseOffsetY,
          radius,
          "#" + Math.floor(Math.random() * 16777215).toString(16),
          "#ffffff",
          this.context
        );

        this.addObj(newCircle);
      }
    }
    if(this.drawingBoardId ==="partB"){
      //console.log("in B")
    }
    if(this.drawingBoardId ==="partC"){
      //console.log("in C")
    }
    if(this.drawingBoardId ==="partD"){
      //console.log("in D")
      const randomCol = "rgb(" + Math.floor(Math.random() * 256) + ", " + Math.floor(Math.random() * 256) + ", " + Math.floor(Math.random() * 256) + ")";
      this.objectsOnCanvas[0].changeColor(randomCol);
    }
  }
  /* method to add obj to canvas */
  addObj(objToAdd) {
    this.objectsOnCanvas.push(objToAdd);
  }

  /* method to add display objects on canvas */
  display() {
    for (let i = 0; i < this.objectsOnCanvas.length; i++) {
      this.objectsOnCanvas[i].display();
    }
  }

  /* method to add animate objects on canvas */
 animate(volume) { // Added volume parameter
    // Clear the canvas so we don't get "trails"
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = 0; i < this.objectsOnCanvas.length; i++) {
     // Pass the volume into the update method
     this.objectsOnCanvas[i].update(volume); 
     this.objectsOnCanvas[i].display();
    }
  }

  run(videoElement){
    for (let i = 0; i < this.objectsOnCanvas.length; i++) {
      this.objectsOnCanvas[i].update(videoElement);
      this.objectsOnCanvas[i].display();
    }

  }
}