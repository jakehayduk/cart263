"use strict";

function setup() {
    console.log("go");
    createCanvas(600, 600);
}

let counter = 0;
let radius = 0;
let ellipseAlpha = 50;
let i = 0;

const rect1 = {
    w: 40,
    h: 40,
    x: 10,
    y: 10,
    r: 255,
    g: 165,
    b: 0
}

function draw() {
    background(0,0,0);

    displaySquare();
    mouseHover();
    
        if (counter >= 1 && counter <= 10) {
            let i = 0;
            let currentRadius = radius;
            let currentAlpha = ellipseAlpha;

            while (i < counter) {
                fill(255, 255, 255, currentAlpha);
                ellipse(width / 2, height / 2, currentRadius);

                currentRadius += 30;
                currentAlpha += 5;
                i++;
            }
        }

        if (counter > 10) {
            counter = 0;
        }
}

function displaySquare() {
    push();
    noStroke();
    fill(rect1.r, rect1.g, rect1.b);
    rect(rect1.x, rect1.y, rect1.w);
    pop();
}

function mousePressed() {
    if (checkCollisionWithSquare()) {
        counter++;
    }
}

function mouseHover() {
    if (checkCollisionWithSquare()) {
        rect1.r = 255;
        rect1.g = 216;
        rect1.b = 178;
    }
    else {
        rect1.r = 255;
        rect1.g = 165;
        rect1.b = 0;
    }
}

function checkCollisionWithSquare() {
    if (mouseX > rect1.x && mouseX < rect1.x + rect1.w &&
        mouseY > rect1.y && mouseY < rect1.y + rect1.w) {
        return true;
    } else {
        return false;
    }
}