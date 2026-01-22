"use strict";

function setup() {
    createCanvas(600, 600);
    background(50, 100, 200);
    drawEllipse(20, 20, 20, 200, 180, 100);
    drawEllipse(50, 50, 40, 200, 50, 150);
    drawEllipse(100, 100, 80, 125, 200, 50);
}

function drawEllipse(x, y, size, r, g, b) {
    push();
    noStroke();
    fill(r, g, b);
    ellipse(x, y, size);
    pop();
}