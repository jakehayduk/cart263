"use strict";

function setup() {
    console.log("go");
    createCanvas(600, 600);
}

let rect1x = 20;
let rect1y = 20;
let rect2x = 50;
let rect2y = 50;
let rect3x = 100;
let rect3y = 100;

function draw() {
    background(50, 180, 163);

    push();
    noStroke();
    fill(125, 250, 10);
    rect(rect1x, rect1y, 20);
    pop();

    push();
    noStroke();
    fill(45, 67, 100);
    rect(rect2x, rect2y, 40);
    pop();

    push();
    noStroke();
    fill(213, 43, 5);
    rect(rect3x, rect3y, 80);
    pop();

    rect3y += 5;
}

function mousePressed() {
    rect1x = random(0, width);
    rect1y = random(0, height);
}

function keyPressed() {
    if (keyCode === 32) {
        rect2x = random(0, width);
        rect2y = random(0, height);
    }
}