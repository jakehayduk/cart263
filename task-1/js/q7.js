"use strict";

let colourR;
let colourG;
let colourB;

function setup() {
    console.log("go");
    createCanvas(600, 600);
    colourR = random(255);
    colourG = random(255);
    colourB = random(255);
}

let counter = 0;
let radius = 50;
let circle = true;

function draw() {
    background(0);

    for (let i = 0; i < 20; i++) {

        for (let a = 0; a < 20; a++) {
            push();
            fill(colourR, colourG, colourB);
            if (circle == true) {
                ellipse(radius * i + radius/2, a * radius + radius/2, radius);
            }
            else {
                rect(radius * i, a * radius, radius);
            }
            pop();
        }
    }
}

function keyPressed() {
    if (keyCode === 32) {
        colourR = random(255);
        colourG = random(255);
        colourB = random(255);
    }
}
    
function mousePressed() {
    if (circle == true) {
        circle = false;
    }
    else {
        circle = true;
    }
}