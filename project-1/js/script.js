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
    let hyphens = "";
    let hockey = "";
    let prompt;
    let dictionary = "";
    let difficulty = 1;
    let usedWords = []; 
    let coins = 0;
    let coinSpin = 0;
    let timerTime = 60;
    let winStreak = 0;
    // DO SOMETHING WITH THE WINSTREAK SO IT GOES FIRE AFTER 5 CONSECUTIVE CORRECT ANSWERS OR SOMETHING

    Promise.all([
    fetch('./dictionaries/words.txt').then(x => x.text()),
    fetch('./dictionaries/birds.txt').then(x => x.text()),
    fetch('./dictionaries/dinosaurs.txt').then(x => x.text()),
    fetch('./dictionaries/hyphens.txt').then(x => x.text()),
    fetch('./dictionaries/hockey.txt').then(x => x.text())
    ]).then(([data1, data2, data3, data4, data5]) => {
        words = data1;
        birds = data2;
        dinos = data3;
        hyphens = data4;
        hockey = data5;

        // set the default dictionary to be all words
        dictionary = words + birds + dinos + hyphens;
        prompt = newPrompt();
    })
    .catch(error => console.error('Error fetching data:', error));


    let textInput = document.querySelector('#textInput');
    let displayText = document.querySelector(".displayText");
    textInput.addEventListener("keydown", function (e) {
        if (e.which === 13) {
            e.preventDefault();
            const dict = dictionary.toLowerCase();
            const answer = textInput.value.toLowerCase().replace(/\;|\:|\=|\./g, "");
            const result = dict.includes("\n" + answer + "\r");
            const checkInclude = answer.includes(prompt);
            const checkDuplicates = usedWords.includes(answer);

            if (result == true && checkInclude == true && answer.length > 2 && checkDuplicates == false) {
                usedWords.push(answer);
                textInput.value = "";
                prompt = newPrompt();
                
                let coinCount = 1;
                winStreak ++;

                if (answer.length > 14) {
                    coinCount += 3;
                }

                if (answer.includes("-")) {
                    coinCount += 3;
                }
                
                coins += coinCount;
                
                document.querySelector(".coins p").textContent = "coins: " + coins;

                coinSpin += 360;
                document.querySelector(".coin-icon").style.transform = "rotateY(" + coinSpin + "deg)";

                const span = document.querySelector('.displayText span');
                const rect = span.getBoundingClientRect();

                displayText.innerHTML = "";

                for (let i = 0; i < coinCount; i++) {
                    let coinExists = true;
                    let coinVX = Math.floor(Math.random() * 5) + 1;
                    let coinVY = Math.floor(Math.random() * 8) + 4;
                    let coinX = 0;
                    let coinY = -120;
                    let newCoin = document.createElement("div");
                    newCoin.classList.add("coin");
                    newCoin.innerHTML = "<img src='./images/coin.png'>";
                    document.querySelector(".gameplay").appendChild(newCoin);
                    setTimeout(function() {
                        newCoin.style.transform = "rotateX(" + Math.floor(Math.random() * 100) + 1 + "deg) rotateY(" + Math.floor(Math.random() * 400) + 1 + "deg) rotateZ(" + Math.floor(Math.random() * 100) + 1 + "deg)";
                            
                        setTimeout(function() {
                            newCoin.remove();
                            coinExists = false;
                        }, 2000)

                        function updateCoin() {
                            if (!coinExists) return;

                            coinVY += -0.1;
                            coinY += coinVY;
                            coinX += coinVX - 2.5;
                            newCoin.style.bottom = rect.bottom + coinY + "px";
                            newCoin.style.left = rect.left + coinX + "px";

                            requestAnimationFrame(updateCoin);
                        }
                        requestAnimationFrame(updateCoin);
                    }, 5)
                }
                
            }

            else {
                winStreak = 0;
                displayText.style.color = "var(--tertiary)";
                displayText.style.animation = "shake 0.3s ease-out";
                setTimeout(function () {
                    displayText.style.color = "var(--primary)";
                    displayText.style.animation = "none";
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

    textInput.addEventListener("input", function() {
        let newHTML = this.value;
        let newHTML2 = newHTML.toLowerCase().replace(prompt, "<span>" + prompt + "</span>");
        displayText.innerHTML = newHTML2;
    })

    document.querySelector("#dropdown").addEventListener("change", function () {
        console.log(this.value);


        if (this.value == "normal") {
            dictionary = words + birds + dinos + hyphens;
        }
        else if (this.value == "birds") {
            dictionary = birds;
        }
        else if (this.value == "dinosaurs") {
            dictionary = dinos;
        }
        else if (this.value == "hockey") {
            dictionary = hockey;
        }
    })

    document.querySelector(".slider").addEventListener("change", function () {
        document.querySelector(".difficulty p").textContent = "difficulty: " + this.value;

        difficulty = this.value;
    })


    let timer = timerTime;
    let gameOn = false;

    document.querySelector(".play-button").addEventListener("click", function () {
        gameStart();
        timer = timerTime;

        const timerInterval = setInterval(myTimer, 1000);
        function myTimer() {
            if (timer > 0 && gameOn == true) {
                timer--;
            }

            if (timer == 0) {
                myStopFunction();
                gameEnd();
                timer = timerTime;
            }

            document.querySelector(".timer").textContent = timer;
        }

        function myStopFunction() {
            clearInterval(timerInterval);
        }
    })

    function gameStart() {
        document.querySelector(".start").style.display = "none";
        document.querySelector(".gameplay").style.display = "flex";
        document.querySelector(".slider").style.display = "none";
        document.querySelector("#dropdown").style.display = "none";
        document.querySelector(".dictionaries p").textContent = "dictionary: " + document.querySelector("#dropdown").value;
        textInput.focus();
        textInput.value = "";
        displayText.innerHTML = "";
        usedWords = [];
        newPrompt();
        gameOn = true;
    }

    function gameEnd() {
        document.querySelector(".start").style.display = "flex";
        document.querySelector(".gameplay").style.display = "none";
        document.querySelector(".slider").style.display = "block";
        document.querySelector("#dropdown").style.display = "block";
        document.querySelector(".dictionaries p").textContent = "dictionary: ";
        gameOn = false;
    }

    document.querySelector(".gameplay").addEventListener("click", function () {
        textInput.focus();
    })
}