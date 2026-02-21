/**
 * Word game
 * Lucie Soussana, Jake Hayduk
 * 
 * A game of making words with the bigrams given
 * 
 * Instructions:
 * - Choose a theme and difficulty level
 * - Bigrams will appear on the screen
 * - Make words using the bigrams
 * - Get a high score before time runs out!
 * 
 * Rule Book:
 * - Words must be at least 3 letters long
 * - Words must include the bigram prompt
 * - 2 seconds will be added to the timer for every correct answer
 * - Gain 5 points for every letter used
 * - Gain 10 points for every hyphen placed
 * 
 */

"use strict";

window.onload = setup;

function setup() {
    let birds = "";
    let words = "";
    let dinos = "";
    let prompt;
    let dictionary = "";
    let difficulty = 1;

    // fetch('../dictionaries/words.txt')
    //     .then(response => response.text())
    //     .then((data) => {
    //         words = data;
    //         // set dictionary to be words as default
    //         dictionary = words;
    //         prompt = newPrompt();
    //     })
    //     .catch(error => console.error('Error fetching data:', error));


    // fetch('../dictionaries/birds.txt')
    //     .then(response => response.text())
    //     .then((data) => {
    //         birds = data;
    //     })
    //     .catch(error => console.error('Error fetching data:', error));

    // fetch('../dictionaries/dinosaurs.txt')
    //     .then(response => response.text())
    //     .then((data) => {
    //         dinos = data;
    //     })
    //     .catch(error => console.error('Error fetching data:', error));

    getText("../dictionaries/birds.txt");
    async function getText(file) {
        let myObject = await fetch(file);
        let myText = await myObject.text();
        console.log(myText);
    }


    let textInput = document.querySelector('#textInput');
    textInput.addEventListener("keydown", function (e) {
        if (e.which === 13) {
            const dict = dictionary.toLowerCase();
            const answer = textInput.value.toLowerCase();
            const result = dict.includes("\n" + answer + "\r");
            const checkInclude = answer.includes(prompt);

            if (result == true && checkInclude == true && answer.length > 2) {
                console.log("correct");
                textInput.value = "";
                prompt = newPrompt();
            }

            else {
                textInput.style.color = "var(--tertiary)";
                setTimeout(function () {
                    textInput.style.color = "var(--primary)";
                }, 500)
            }
        }
    })

    function newPrompt() {
        prompt = bigrams[Math.floor(Math.random() * (bigrams.length / 10 * difficulty - 1))][0];

        // make it cycle through until it picks a bigram that is included in the various lists
        while (dictionary.includes(prompt) == false) {
            prompt = bigrams[Math.floor(Math.random() * (bigrams.length / 10 * difficulty - 1))][0];
        }

        // console.log((10 / difficulty ** 2) + 0.9);
        // console.log(bigrams[Math.round((bigrams.length - 1) / ((10 / difficulty ** 2) + 0.9))][0]);
        document.querySelector('.prompt').textContent = prompt.toUpperCase();
        return prompt;
    }



    document.querySelector("#dropdown").addEventListener("change", function () {
        console.log(this.value);


        if (this.value == "normal") {
            dictionary = words;
        }
        else if (this.value == "birds") {
            dictionary = birds;
        }
        else if (this.value == "dinosaurs") {
            dictionary = dinos;
        }

        newPrompt();
    })

    document.querySelector(".slider").addEventListener("change", function () {
        document.querySelector(".difficulty p").textContent = "difficulty: " + this.value;

        difficulty = this.value;
    })

    // Buttons

    let timer = 60;

    document.querySelector(".play-button").addEventListener("click", function () {
        document.querySelector(".start").style.display = "none";
        document.querySelector(".gameplay").style.display = "flex";
        timer = 60;
        setInterval(function () {
            if (timer > 0) {
                timer--;
                document.querySelector(".timer").textContent = timer;
            }
        }, 1000)
    })
}