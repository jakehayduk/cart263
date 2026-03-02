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
    // global variables
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
    let coinsChange = 0
    let coinSpin = 0;
    let timerTime = 60;
    let winStreak = 0;
    let winStreakSound = false;
    let promptTime;
    let answerTimes = [];
    let answerPrompts = [];
    let answerStreaks = []

    let sound1 = new Audio('./sounds/sound-1.mp3');
    let sound2 = new Audio('./sounds/sound-2.mp3');
    let soundFire = new Audio('./sounds/fire.mp3');
    let soundCoin1 = new Audio('./sounds/coin1.mp3');
    let soundCoin2 = new Audio('./sounds/coin2.mp3');
    let soundCoin3 = new Audio('./sounds/coin3.mp3');
    let soundIncorrect = new Audio('./sounds/incorrect.mp3');
    let volume = 1;

    // fetch the dictionary text files
    Promise.all([
    fetch('./dictionaries/words.txt').then(x => x.text()),
    fetch('./dictionaries/birds.txt').then(x => x.text()),
    fetch('./dictionaries/dinosaurs.txt').then(x => x.text()),
    fetch('./dictionaries/hyphens.txt').then(x => x.text()),
    fetch('./dictionaries/hockey.txt').then(x => x.text())
    ]).then(([data1, data2, data3, data4, data5]) => {
        // place them in their respective variables once loaded
        words = data1;
        birds = data2;
        dinos = data3;
        hyphens = data4;
        hockey = data5;

        // set the default dictionary to be all words
        dictionary = words + birds + dinos + hyphens;

        // set the prompt function
        prompt = newPrompt();
    })
    .catch(error => console.error('Error fetching data:', error));

    // query the typing input and the display of the typed text
    let textInput = document.querySelector('#textInput');
    let displayText = document.querySelector(".displayText");
    
    textInput.addEventListener("keydown", function (e) {
        // use the enter key to answer a prompt
        if (e.which === 13) {
            e.preventDefault();
            // make the text lowercase for proper unity and remove any accidental characters / uneeded characters from the player's answers
            const dict = dictionary.toLowerCase();
            const answer = textInput.value.toLowerCase().replace(/\;|\:|\=|\.|\,|0|1|2|3|4|5|5|6|7|8|9|\"|\\|\]|\{|\[|\{|\//g, "");
            // check for includes consistent with all of our dictionary formatting
            const result = dict.includes("\n" + answer + "\r");
            const checkInclude = answer.includes(prompt);
            const checkDuplicates = usedWords.includes(answer);

            // if the dictionary includes the typed answer, the typed answer includes the given prompt, is longer than 2 characters, and hasn't been typed already yet, the output is correct
            if (result == true && checkInclude == true && answer.length > 2 && checkDuplicates == false) {
                usedWords.push(answer);
                textInput.value = "";
                
                // add 1 coin for each correct answer, 3 more for words longer than 14 characters, and 3 more for hyphenated words
                let coinCount = 1;

                if (answer.length > 14) {
                    coinCount += 3;
                }

                if (answer.includes("-")) {
                    coinCount += 3;
                }

                if (coinCount == 1) {
                    soundCoin1.play();
                }

                else if (coinCount == 4) {
                    soundCoin2.play();
                }

                else if (coinCount == 7) {
                    soundCoin3.play();
                }
                
                // add extra coins if the streak is ongoing
                if (winStreak > 4) {
                    coinCount = coinCount + 3;
                }

                // coins is the TOTAL coins and coinCount is the counted coins for any given prompt answer. coinsChange counts the coins per round
                
                coins += coinCount;
                coinsChange += coinCount;
                
                document.querySelector(".coins p").textContent = "coins: " + coins;

                // coin icon spins 360 deg every correct answer
                coinSpin += 360;
                document.querySelector(".coin-icon").style.transform = "rotateY(" + coinSpin + "deg)";

                // get the position of the part of the answer that cointains the prompt. In this case, it's the only span element
                const span = document.querySelector('.displayText span');
                let rect;
                if (span) {
                    rect = span.getBoundingClientRect();
                }
                else {
                    rect = document.querySelector(".prompt").getBoundingClientRect();
                }
                

                displayText.innerHTML = "";

                // create the amount of coins based on the coinCount variable
                for (let i = 0; i < coinCount; i++) {
                    // give each new coin a random x and y velocity
                    let coinExists = true;
                    let coinVX = Math.floor(Math.random() * 5) + 1;
                    let coinVY = Math.floor(Math.random() * 8) + 4;
                    let coinX = 0;
                    let coinY = -120;
                    // create each coin element
                    let newCoin = document.createElement("div");
                    newCoin.classList.add("coin");
                    newCoin.innerHTML = "<img src='./images/coin.png'>";
                    document.querySelector(".gameplay").appendChild(newCoin);

                    // delay the style changes so that the css transitions actually have time to realize they exist and work properly
                    setTimeout(function() {
                        // random 3D transforms to each coin to make it spin
                        newCoin.style.transform = "rotateX(" + Math.floor(Math.random() * 100) + 1 + "deg) rotateY(" + Math.floor(Math.random() * 400) + 1 + "deg) rotateZ(" + Math.floor(Math.random() * 100) + 1 + "deg)";
                        
                        // remove each coin after 2 seconds
                        setTimeout(function() {
                            newCoin.remove();
                            coinExists = false;
                        }, 2000)

                        // update each coin's position and close the loop using the return if the coin no longer exists
                        let lastTime = 0;
                        function updateCoin(currentTime) {
                            if (!coinExists) return;
                            let deltaTime = currentTime - lastTime;
                            // change the coin's velocity by a negative gravitational accelerant constant
                            coinVY += -0.00004 * deltaTime;
                            // update the x and y positions based on the velocities
                            coinY += coinVY;
                            coinX += coinVX - 2.5;
                            // update the element position
                            newCoin.style.bottom = rect.bottom + coinY + "px";
                            newCoin.style.left = rect.left + coinX + "px";

                            
                            requestAnimationFrame(updateCoin);
                        }
                        requestAnimationFrame(updateCoin);
                    }, 5)
                }
                
                // get the difference of time between the two Date() objects (it gives it in milliseconds)
                promptTime = (new Date()) - promptTime;
                // log the time difference and the prompt itself so we know how long it takes for the player to answer each prompt
                answerTimes.push(promptTime);
                answerPrompts.push(prompt);

                // add 1 to the win streak unless their time is over 4.5 seconds
                winStreak ++;

                if (promptTime > 4500) {
                    winStreak = 0;
                }

                // log the win streak and call for a new prompt
                answerStreaks.push(winStreak);
                
                prompt = newPrompt();
            }

            else {
                // if the player gets the answer wrong, reset the win streak and play the incorrect animation
                soundIncorrect.play();
                winStreak = 0;
                displayText.style.color = "var(--tertiary)";
                displayText.style.animation = "shake 0.3s ease-out";
                setTimeout(function () {
                    displayText.style.color = "var(--primary)";
                    displayText.style.animation = "none";
                }, 500)
            }

            // at 5 consecutive correct answers, display the fire to indicate the player's win streak
            if (winStreak > 4) {
                document.querySelector(".fire").style.display = "block";
                
                if (!winStreakSound) {
                    winStreakSound = true;
                    soundFire.play();
                }
                
            }

            else {
                winStreakSound = false;
                document.querySelector(".fire").style.display = "none";
            }
        }
    })

    function newPrompt() {
        // initial prompt calculation that randomly picks from the list of bigrams array in bigrams.js based on the current set difficulty
        prompt = bigrams[Math.floor(Math.random() * (bigrams.length / 10 * difficulty - 1))][0];

        // this loop cycles through the prompts until it finds one that is included in the current dictionary
        while (dictionary.includes(prompt) == false) {
            prompt = bigrams[Math.floor(Math.random() * (bigrams.length / 10 * difficulty - 1))][0];
        }

        // start the promptTime timer
        promptTime = new Date();

        // display the prompt in the prompt h3 element
        document.querySelector('.prompt').textContent = prompt.toUpperCase();
        return prompt;
    }

    // when the player types
    textInput.addEventListener("input", function() {
        // add a span tag around where the prompt appears in the typed answer so we can distinguish it
        let newHTML = this.value;
        let newHTML2 = newHTML.toLowerCase().replace(prompt, "<span>" + prompt + "</span>");
        displayText.innerHTML = newHTML2;
    })

    // when something is selected from the dictionaries dropdown list
    document.querySelector("#dropdown").addEventListener("change", function () {

        // change the dictionary depending on the selected value
        if (this.value == "normal") {
            // the 'normal' dictionary includes all other dictionaries that contain valid words that are not proper noun dictionaries
            dictionary = words + birds + dinos + hyphens;
        }
        else if (this.value == "birds") {
            dictionary = birds;
        }
        else if (this.value == "dinosaurs") {
            dictionary = dinos;
        }
        else if (this.value == "hockey players") {
            dictionary = hockey;
        }

        sound1.play();

        saveStateHandler();
    })

    // update the difficulty based on the slider value
    document.querySelector(".slider").addEventListener("change", function () {
        document.querySelector(".difficulty p").textContent = "difficulty: " + this.value;

        difficulty = this.value;
        sound1.play();

        saveStateHandler();
    })

    // set the timer to be the 
    let timer = timerTime;
    let gameOn = false;

    // click play button to start
    document.querySelector(".play-button").addEventListener("click", function () {
        sound2.play();
        gameStart();
        
        // The game timer
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

    // hide the start menu and display the game, reset variables, call newPrompt and focus on the text field
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
        answerTimes = [];
        answerPrompts = [];
        answerStreaks = [];
        winStreak = 0;
        coinsChange = 0;
        document.querySelector(".fire").style.display = "none";
        newPrompt();
        gameOn = true;
    }

    // hide the game and display the start menu
    function gameEnd() {
        document.querySelector(".start").style.display = "flex";
        document.querySelector(".gameplay").style.display = "none";
        document.querySelector(".slider").style.display = "block";
        document.querySelector("#dropdown").style.display = "block";
        document.querySelector(".dictionaries p").textContent = "dictionary: ";
        gameOn = false;

        // get the longest prompt answer time
        const maxNumber = Math.max(...answerTimes);
        const index = answerTimes.indexOf(maxNumber);

        // display the time and the prompt it was used on, as well as the longest answer streak
        document.querySelector(".stats").innerHTML = "<h2>+" + coinsChange + " coins</h2><p>You spent " + (answerTimes[index]/1000).toFixed(2) + "s on the prompt \"" + answerPrompts[index].toUpperCase() + "\" and answered \"" + usedWords[index].toUpperCase() + "\".</p><p>Your longest streak was " + Math.max(...answerStreaks) + ".</p>";

        saveStateHandler();
    }

    // make sure the text input is focused when clicking anywhere in the parent div
    document.querySelector(".gameplay").addEventListener("click", function () {
        textInput.focus();
    })

    
    
    // uncomment the below line to clear the saved settings and coins for testing purposes
    // localStorage.clear();
    
    // save game settings and coin amount
    function saveStateHandler() {
        
        // save the values to local storage if they are not default values
        if (coins !== 0) {
            localStorage.setItem("coins", coins);
        }

        if (difficulty !== 1) {
            localStorage.setItem("difficulty", difficulty);
        }

        if (document.querySelector("#dropdown").value !== "normal") {
            localStorage.setItem("dictionary", document.querySelector("#dropdown").value);
        }

        if (volume !== 10) {
            localStorage.setItem("volume", volume);
        }
    }

    // retrieve game settings and coin amount
    function retrieveHandler() {
        
        // once again check to see if the settings are not default or null and update the displayed settings to match the local saves
        let localCoins = Number(localStorage.getItem("coins"));
        if (localCoins !== 0) {
            coins = localCoins;
            document.querySelector(".coins p").textContent = "coins: " + coins;
        }
        
        let localDifficulty = Number(localStorage.getItem("difficulty"));
        if (localDifficulty !== 0) {
            difficulty = localDifficulty;
            document.querySelector(".difficulty p").textContent = "difficulty: " + difficulty;
            document.querySelector(".slider").value = difficulty;
        }
        
        let localDictionary = localStorage.getItem("dictionary");
        if (localDictionary !== null && localDictionary !== "") {
            document.querySelector("#dropdown").value = localDictionary;
        }
        
        let localVolume = Number(localStorage.getItem("volume"));
        if (localVolume) {
            changeVolume(localVolume * 10)
            document.querySelector(".volume-slider").value = localVolume * 10;
        }
    } 
    
    retrieveHandler();

    // settings menu open and close animations
    let settingsOpen = false;
    document.querySelector(".settings-button").addEventListener("click", function () {
        sound1.play();
        const settings = document.querySelector(".settings");
        if (!settingsOpen) {
            settings.style.display = "flex";
            setTimeout(function() {
                settings.style.transform = "translateY(0)";
                document.querySelector(".slider").style.backgroundColor = "var(--secondary)";
                document.querySelector("select").style.backgroundColor = "var(--secondary)";
                document.querySelector("select").style.color = "var(--primary)";
                document.querySelector(".coins").style.color = "var(--secondary)";
                document.querySelector(".timer").style.color = "var(--secondary)";
                document.querySelector(".dictionaries").style.color = "var(--secondary)";
                document.querySelector(".difficulty").style.color = "var(--secondary)";
                settingsOpen = true;
            }, 5)
        }
        else {
            settings.style.transform = "translateY(-100vh)";
            document.querySelector(".slider").style.backgroundColor = "var(--primary)";
            document.querySelector("select").style.backgroundColor = "var(--primary)";
            document.querySelector("select").style.color = "var(--secondary)";
            document.querySelector(".coins").style.color = "var(--primary)";
            document.querySelector(".timer").style.color = "var(--primary)";
            document.querySelector(".dictionaries").style.color = "var(--primary)";
            document.querySelector(".difficulty").style.color = "var(--primary)";
            settingsOpen = false;
        }
    })

    // change the game volume based on the volume slider value
    document.querySelector(".volume-slider").addEventListener("change", function () {
        changeVolume(this.value);     
        sound1.play();
        saveStateHandler();
    })

    function changeVolume(value) {
        volume = value / 10;
        
        sound1.volume = volume;
        sound2.volume = volume;
        soundFire.volume = volume;
        soundCoin1.volume = volume;
        soundCoin2.volume = volume;
        soundCoin3.volume = volume;
        soundIncorrect.volume = volume;

    }
}