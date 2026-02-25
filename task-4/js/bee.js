class Bee {
    constructor(x, y, beeSize, beeHive) {
        this.x = x;
        this.y = y;
        this.beeSize = beeSize;
        this.beehive = beeHive;
        this.isAtHome = false;
        this.beeImg = document.createElement("img");
        this.vx = 5;
        this.vy = 5;

        let self = this;
        let random = Math.floor(Math.random() * 10000) + 5000;

        setInterval(function () {
            self.beeHome();
        }, random);

        function animateBee() {
            self.animateBee();

            requestAnimationFrame(animateBee);
        }
        window.requestAnimationFrame(animateBee);
    }

    renderBee() {
        this.beeImg.classList.add("bee");
        this.beeImg.src = './images/danny.png';
        this.beeImg.style.width = this.beeSize + "px";
        this.beeImg.style.position = "absolute";
        this.beeImg.style.zIndex = 1;
        document.querySelector(".sky").appendChild(this.beeImg)
    }

    animateBee() {
        this.x += this.vx;
        this.y += this.vy;
        this.beeImg.style.left = this.x + "px";
        this.beeImg.style.top = this.y + "px";

        if (this.x > window.innerWidth - this.beeSize || this.x < 0) {
            this.vx = -this.vx;
        }
        if (this.y > window.innerHeight - this.beeSize || this.y < 0) {
            this.vy = -this.vy;
        }
    }

    // Sends the bees home at random intervals, and sends them back out after random time
    beeHome() {
        this.x = this.beehive.x + this.beehive.size / 2 - this.beeSize / 2;
        this.y = this.beehive.y + this.beehive.size / 2 - this.beeSize / 2;

        if (this.isAtHome) {
            this.isAtHome = false;
            this.vx = Math.floor(Math.random() * 8) + 3;
            this.vy = Math.floor(Math.random() * 8) + 3;
        } else {
            this.isAtHome = true;
            this.vx = 0;
            this.vy = 0;
        }

        // Only update the display
        this.beehive.updateCounter();
    }
}