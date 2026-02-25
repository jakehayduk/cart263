class BeeHive {
    constructor(x, y, size, color, id) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.id = id;

        // Match the variable name used in your original hex loop
        this.beeHiveDiv = document.createElement("div");
        this.counterDiv = document.createElement("div");
        this.bees = [];

        this.floatOffset = 0;
        this.floatDirection = 1;
    }

    renderBeeHive() {
        this.beeHiveDiv.classList.add("beehive");
        this.beeHiveDiv.style.left = this.x + "px";
        this.beeHiveDiv.style.top = this.y + "px";
        this.beeHiveDiv.style.width = this.size + "px";
        this.beeHiveDiv.style.height = this.size + "px";
        this.beeHiveDiv.style.position = "absolute";
        this.beeHiveDiv.style.zIndex = "2";

        // Counter Styling - Positioned under the hive
        this.counterDiv.style.position = "absolute";
        this.counterDiv.style.left = this.x + "px";
        // Positioned below the hive (y + height + padding)
        this.counterDiv.style.top = (this.y + 200) + "px";
        this.counterDiv.style.width = "120px"; // Adjust based on hive width
        this.counterDiv.style.textAlign = "center";

        // Visual styling with padding
        this.counterDiv.style.padding = "8px 12px";
        this.counterDiv.style.background = "rgba(255, 255, 255, 0.8)";
        this.counterDiv.style.borderRadius = "8px";
        this.counterDiv.style.fontWeight = "bold";
        this.counterDiv.style.zIndex = "100";

        this.updateCounter();

        // Append to the sky or grass div so it stays at these coordinates
        document.querySelector(".sky").appendChild(this.counterDiv);

        // ... your existing hexagon loop ...
        let positions = [
            { x: 25, y: 0 }, { x: 0, y: 40 }, { x: 50, y: 40 },
            { x: 25, y: 80 }, { x: 75, y: 80 }, { x: 50, y: 120 }
        ];

        for (let pos of positions) {
            let hex = document.createElement("div");
            hex.classList.add("hex");
            hex.style.left = pos.x + "px";
            hex.style.top = pos.y + "px";
            hex.style.position = "absolute";
            hex.style.width = (this.size / 2) + "px";
            hex.style.height = (this.size / 2) + "px";
            hex.style.clipPath = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";
            hex.style.backgroundColor = `rgb(${this.color.r},${this.color.g},${this.color.b})`;
            this.beeHiveDiv.appendChild(hex);
        }

        document.querySelector(".sky").appendChild(this.beeHiveDiv);
        this.animateHive();
    }

    updateCounter() {
        this.counterDiv.innerText = `Hive ${this.id + 1} Bees: ` + this.countBeesAtHome();
    }

    animateHive() {
        const animate = () => {
            this.floatOffset += 0.3 * this.floatDirection;
            if (this.floatOffset > 10 || this.floatOffset < -10) {
                this.floatDirection *= -1;
            }
            this.beeHiveDiv.style.transform = `translateY(${this.floatOffset}px)`;
            requestAnimationFrame(animate);
        };
        animate();
    }

    addBee(bee) {
        this.bees.push(bee);
    }

    countBeesAtHome() {
        return this.bees.filter(bee => bee.isAtHome).length;
    }
}