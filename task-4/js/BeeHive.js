class BeeHive{
    constructor(x,y, hiveColor){
        this.x = x;
        this.y = y;
        this.hiveColor = hiveColor;
        this.hiveDiv =  document.createElement("div");
        this.vx = 1;
        this.vy =1;
        self = this;
      
        
}

    renderBeeHive(){
    // //hive - IN the sky
    this.hiveDiv.classList.add("hive");
    this.hiveDiv.style.background = `rgb(${this.hiveColor.r},${this.hiveColor.g},${this.hiveColor.b})`;
    this.hiveDiv.style.left = this.x + 'px';
    this.hiveDiv.style.top = this.y + 'px';
    // //append to the SKY div
    document.querySelector(".sky").appendChild(this.hiveDiv);
    }

    updateDivPos() {
        console.log("update")
        this.hiveDiv.style.left = this.x + "px";
        this.hiveDiv.style.top = this.y + "px";
      }

}