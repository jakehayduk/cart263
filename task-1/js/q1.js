"use strict";

function setup() {
    console.log("go");
    createCanvas(600, 600);
}

function draw() {
    background(50, 100, 200);

    push();
    noStroke();
    fill(200, 180, 100);
    ellipse(20, 20, 20);
    pop();

    push();
    noStroke();
    fill(200, 50, 150);
    ellipse(50, 50, 40);
    pop();

    push();
    noStroke();
    fill(125, 200, 50);
    ellipse(100, 100, 80);
    pop();
}