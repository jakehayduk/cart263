class BeeHive{
    constructor(x,y, hiveColor, size){
        this.x = x;
        this.y = y;
        this.hiveColor = hiveColor;
        this.hiveDiv =  document.createElement("div");
        this.vx = 1;
        this.vy =1;
        self = this;
        this.size = size;
}

    renderBeeHive(){
        // //hive - IN the sky
        this.hiveDiv.classList.add("hive");
        this.hiveDiv.style.background = `rgb(${this.hiveColor.r},${this.hiveColor.g},${this.hiveColor.b})`;
        this.hiveDiv.style.left = this.x + 'px';
        this.hiveDiv.style.top = this.y + 'px';
        this.hiveDiv.style.width = this.size + 'px';
        this.hiveDiv.style.height = this.size + 'px';
        // //append to the SKY div
        document.querySelector(".sky").appendChild(this.hiveDiv);

    }

    updateHivePos() {
        this.hiveDiv.style.left = this.x + Math.floor(Math.random() * 10) - 5 + 'px';
        this.hiveDiv.style.top = this.y + Math.floor(Math.random() * 10) -5 + 'px';
    }

}