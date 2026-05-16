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

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js'
import { getDatabase, get, set, ref, push, onDisconnect, remove, update, onValue, onChildAdded, onChildRemoved, query, orderByChild, limitToFirst, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js'


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBdD0rHp9nriI124Ub1gdbsaLgR26Fo57s",
    authDomain: "word-nerd-7bcf7.firebaseapp.com",
    projectId: "word-nerd-7bcf7",
    storageBucket: "word-nerd-7bcf7.firebasestorage.app",
    messagingSenderId: "484707208649",
    appId: "1:484707208649:web:4c96f5c167ec8ffffdec18",
    measurementId: "G-L0N55SDFXG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Global database variable to reference in our other scripts
window.db = getDatabase(app);
window.auth = getDatabase(app);

window.onload = setup;

function setup() {
    // global variables
    let birds = "";
    let words = "";
    let dinos = "";
    let hyphens = "";
    let hockey = "";
    let moviesShows = "";
    let anatomy = "";
    let prompt;
    let dictionary = "";
    let difficulty = 1;
    let usedWords = [];
    let coins = 0;
    let coinsChange = 0
    let coinSpin = 0;
    let winStreak = 0;
    let winStreakSound = false;
    let promptTime;
    let answerTimes = [];
    let answerPrompts = [];
    let answerStreaks = [];
    let avatar = 1;
    let yourTurnTrigger = false;
    let turnTimer;
    let streakTimer;
    let timerTime = 7;

    // load sounds
    let sound1 = new Audio('./sounds/sound-1.mp3');
    let sound2 = new Audio('./sounds/sound-2.mp3');
    let soundFire = new Audio('./sounds/fire.mp3');
    let soundCoin1 = new Audio('./sounds/coin1.mp3');
    let soundCoin2 = new Audio('./sounds/coin2.mp3');
    let soundCoin3 = new Audio('./sounds/coin3.mp3');
    let soundIncorrect = new Audio('./sounds/incorrect.mp3');
    let loseHealth = new Audio('./sounds/lose-health.mp3');
    let volume = 1;

    // fetch the dictionary text files
    Promise.all([
    fetch('./dictionaries/words.txt').then(x => x.text()),
    fetch('./dictionaries/birds.txt').then(x => x.text()),
    fetch('./dictionaries/dinosaurs.txt').then(x => x.text()),
    fetch('./dictionaries/hyphens.txt').then(x => x.text()),
    fetch('./dictionaries/hockey.txt').then(x => x.text()),
    fetch('./dictionaries/moviesShows.txt').then(x => x.text()),
    fetch('./dictionaries/anatomy.txt').then(x => x.text())
    ]).then(([data1, data2, data3, data4, data5, data6, data7]) => {
        // place them in their respective variables once loaded
        words = data1;
        birds = data2;
        dinos = data3;
        hyphens = data4;
        hockey = data5;
        moviesShows = data6;
        anatomy = data7;

        // set the default dictionary to be all words
        dictionary = words + birds + dinos + hyphens + anatomy;

        // set the prompt function
        prompt = newPrompt();

        // retrieve locally stored data once the dictionaries are loaded
        retrieveHandler();
    })
    .catch(error => console.error('Error fetching data:', error));

    // query the typing input and the display of the typed text
    let textInput = document.querySelector('#textInput');
    let displayText = document.querySelector(".displayText");

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

    function changeDictionary(value) {
        // change the dictionary depending on the selected value
        if (host === false) {
            document.querySelector("#dropdown").value = value;
        }
        if (value == "normal") {
            // the 'normal' dictionary includes all other dictionaries that contain valid words that are not proper noun dictionaries
            dictionary = words + birds + dinos + hyphens;
        }
        else if (value == "birds") {
            dictionary = birds;
        }
        else if (value == "dinosaurs") {
            dictionary = dinos;
        }
        else if (value == "hockey players") {
            dictionary = hockey;
        }
        else if (value == "movies/shows") {
            dictionary = moviesShows;
        }
        else if (value == "anatomy") {
            dictionary = anatomy;
        }
    }

    let gameOn = false;
    let name;
    let playerRef;
    let messageRef;
    let selfPlayerRef;
    let playerId;
    let host = false;

    function joinGame() {
        textInput.addEventListener("keydown", function (e) {
            // use the enter key to answer a prompt
            if (e.which === 13) {
                e.preventDefault();
                // make the text lowercase for proper unity and remove any accidental characters / uneeded characters from the player's answers
                const dict = dictionary.toLowerCase();
                const answer = textInput.value.toLowerCase().replace(/\;|\:|\=|\.|\,|0|1|2|3|4|5|5|6|7|8|9|\"|\\|\]|\{|\[|\{|\//g, "");
                // check for includes consistent with all of our dictionary formatting
                const result = dict.includes("\n" + answer + "\r");
                // simmilar check but for systems using LF line break formatting (GitHub) instead of CLRF like the above
                const result2 = dict.includes("\n" + answer + "\n");
                const checkInclude = answer.includes(prompt);
                // check for used words in the master list stored as an array in the host node
                let checkDuplicates;

                const hostPlayer = playerArray.find(p => p.player.host === true);
                if (hostPlayer.player.usedWords) {
                    checkDuplicates = hostPlayer.player.usedWords.includes(answer);
                }
                else {
                    checkDuplicates = false;
                }

                // if the dictionary includes the typed answer, the typed answer includes the given prompt, is longer than 2 characters, and hasn't been typed already yet, the output is correct
                if ((result == true || result2 == true) && checkInclude == true && answer.length > 2 && checkDuplicates == false) {
                    clearTimeout(turnTimer);
                    clearTimeout(streakTimer);
                    yourTurnTrigger = false;

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
                        update(selfPlayerRef, {
                            winStreak: true
                        })
                    }

                    // coins is the TOTAL coins and coinCount is the counted coins for any given prompt answer. coinsChange counts the coins per round
                    coins += coinCount;
                    coinsChange += coinCount;
                    
                    document.querySelector(".coins p").innerHTML = "<span>coins: </span>" + coins;
                    update(selfPlayerRef, {
                        coins: coins
                    })
                    saveStateHandler();

                    // coin icon spins 360 deg every correct answer
                    coinSpin += 360;
                    document.querySelector(".coin-icon").style.transform = "rotateY(" + coinSpin + "deg)";

                    // get the position of the part of the answer that contains the prompt. In this case, it's the only span element
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

                                if (lastTime) {
                                    // use a delta time to ensure consistant animation speed across devices
                                    const deltaTime = (currentTime - lastTime) / 1000;

                                    // change the coin's velocity by a negative gravitational accelerant constant
                                    coinVY += -18 * deltaTime;

                                    // update the x and y positions based on the velocities
                                    coinY += coinVY;
                                    coinX += coinVX - 2.5;

                                    // update the element position
                                    newCoin.style.bottom = rect.bottom + coinY + "px";
                                    newCoin.style.left = rect.left + coinX + "px";
                                }
                            
                                lastTime = currentTime;
                                
                                requestAnimationFrame(updateCoin);
                            }
                            requestAnimationFrame(updateCoin);
                        }, 5)
                    }                  

                    // add 1 to the win streak
                    winStreak ++;

                    prompt = newPrompt();

                    // next player's turn
                    if (playerTurn >= playerArray.length - 1) {
                        playerTurn = 0;
                    }
                    else {
                        playerTurn ++; 
                    }

                    // update the used words master list in the player node
                    let newUsedWords = hostPlayer.player.usedWords;
                    if (!newUsedWords) {
                        newUsedWords = [];
                        newUsedWords.push(answer);
                    }
                    else {
                        newUsedWords.push(answer);
                    }
                    // update the host variables with the player turn, prompt, and used words
                    update(ref(db, "players/" + hostPlayer.playerKey), {
                        playerTurn: playerTurn,
                        prompt: prompt,
                        usedWords: newUsedWords
                    })

                    update(selfPlayerRef, {
                        typing: ""
                    })
                }

                else {
                    // if the player gets the answer wrong, reset the win streak and play the incorrect animation
                    soundIncorrect.play();
                    displayText.style.color = "var(--tertiary)";
                    displayText.style.animation = "shake 0.3s ease-out";
                    setTimeout(function () {
                        displayText.style.color = "var(--primary)";
                        displayText.style.animation = "none";
                    }, 500)

                    // knock some health off as well
                    if (playerArray[playerTurn].player.health > 0) {
                        update(selfPlayerRef, {
                            health: playerArray[playerTurn].player.health - 5
                        })
                    }

                    // cancel the win streak
                    winStreak = 0;
                    update(selfPlayerRef, {
                        winStreak: false
                    })
                }

                // at 5 consecutive correct answers, play the win streak sound
                if (winStreak > 5) {
                    if (!winStreakSound) {
                        winStreakSound = true;
                        soundFire.play();
                    }
                }
                else {
                    winStreakSound = false;
                }
            }
        })

        // display the game
        document.querySelector(".title-screen").style.display = "none";
        document.querySelector(".gameplay").style.display = "flex";
        document.querySelector("header").style.display = "flex";

        // reference all the player nodes in Firebase
        playerRef = ref(db, "players/");
        
        // reference the chat messages
        messageRef = ref(db, "messages/");

        // new player reference gets pushed into the database
        selfPlayerRef = push(playerRef);
        // get your player ID
        playerId = selfPlayerRef.key;

        let playerArray = [];
        let alivePlayers = [];
        let playerTurn = 0;
        let yourTurn = false;
        let resetTurnText = false;
        let waiting = false

        // if you close the window or refresh the page, remove your player node from the database
        onDisconnect(selfPlayerRef).remove();

        // send a leave message on disconnect
        const leaveMessageRef = push(messageRef);

        onDisconnect(leaveMessageRef).set({
            name: name,
            status: "leave",
            timestamp: serverTimestamp(),
            playerId: playerId
        });

        const dictName = document.querySelector("#dropdown").value;

        // initial query to see if there is someone already in the game
        const firstPlayerQuery = query(playerRef, limitToFirst(1))
        get(firstPlayerQuery).then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((playerSnapshot) => {
                    const player = playerSnapshot.val();

                    // check if that player is already playing
                    if (player.playing === true) {
                        // set your status to wait for them to stop playing
                        waiting = true;
                        document.querySelector(".waiting").textContent = "Waiting for " + player.name + "\'s game to end"
                    }
                    // if they're not, join the game
                    else {
                        createPlayer();
                    }
                })
            }
            // if no one is in the game, join the game
            else {
                createPlayer();
            }
        })

        function createPlayer() {
            // set the base variables for your player in Firebase
            const date = new Date();
            set(selfPlayerRef, {
                timestamp: date.getTime(),
                name: name,
                coins: coins,
                health: 0,
                avatar: avatar,
                host: false,
                dictionary: dictName,
                difficulty: difficulty,
                timerTime: timerTime,
                playerTurn: 0,
                prompt: "er",
                typing: "",
                playing: false,
                waiting: false,
                usedWords: [],
                winStreak: false
            })
        }

        
        // this function fires when player values are updated
        onValue(playerRef, (snapshot) => {
            if (snapshot.exists()) {
                playerArray = [];
                // loop through the player objects and push them into a local array, along with the respective player keys
                snapshot.forEach((playerSnapshot) => {
                    const player = playerSnapshot.val();
                    const playerKey = playerSnapshot.key;

                    // push each player object into the local array
                    playerArray.push({playerKey, player});
                })

                if (playerArray.length == 1 && host !== true) {
                    host = true;
                    update(selfPlayerRef, {
                        host: true
                    })
                }

                // display the players
                document.querySelector(".players-container").innerHTML = "";
                
                for (let i = 0; i < playerArray.length; i++) {
                    // for each player in the array, create a player item that is displayed
                    const newPlayerItem = document.createElement('div');

                    newPlayerItem.innerHTML = "<img src='./images/avatar-" + playerArray[i].player.avatar + ".png' class='player-item-avatar'>" + playerArray[i].player.name + " &bullet; " + playerArray[i].player.coins + "<div class='health'></div><img src='./images/fire.gif' class='fire'>";
                    newPlayerItem.className = "player-item";
                    newPlayerItem.id = playerArray[i].playerKey;

                    // if the player is you
                    if (playerArray[i].playerKey == playerId) {
                        newPlayerItem.style.backgroundColor = "var(--primary)";
                        newPlayerItem.style.color = "var(--secondary)";
                    }

                    // if the player is the host, display the crown
                    if (playerArray[i].player.host === true) {
                        newPlayerItem.querySelector(".player-item-avatar").src = "./images/avatar-" + playerArray[i].player.avatar + "-crown.png"
                    }
                    else {
                        newPlayerItem.querySelector(".player-item-avatar").src = "./images/avatar-" + playerArray[i].player.avatar + ".png"
                    }

                    if (gameOn) {
                        // if it's the player's turn, highlight them red
                        const hostPlayer = playerArray.find(p => p.player.host === true);
                        if (i == hostPlayer.player.playerTurn) {
                            newPlayerItem.style.backgroundColor = "rgb(from var(--tertiary) r g b / 0.3)";
                            newPlayerItem.style.color = "var(--primary)";
                        }

                        // display the health bar
                        newPlayerItem.querySelector(".health").style.width = playerArray[i].player.health + "%";

                        // if they're dead, gray them out
                        if (playerArray[i].player.health <= 0) {
                            newPlayerItem.style.filter = "grayscale() brightness(80%)";
                        }

                        // if the player has a win streak
                        if (playerArray[i].player.winStreak === true) {
                            newPlayerItem.querySelector(".fire").style.display = "block";
                        }
                        else {
                            newPlayerItem.querySelector(".fire").style.display = "none";
                        }
                    }
                    else {
                        newPlayerItem.querySelector(".health").style.width = "0%";
                    }
                    
                    document.querySelector(".players-container").appendChild(newPlayerItem);
                }
                    
                // if your player ID matches the player ID of the first player in the array we got from the database, it means you joined first or you are the only player who has joined, and you are the host or controller of the game
                if (gameOn === false) {
                    const hostPlayer = playerArray.find(p => p.player.host === true);
                    if (hostPlayer.playerKey == playerId) {
                        host = true;
                        // set your host value to true
                        update(selfPlayerRef, {
                            host: true
                        })

                        document.querySelector(".play-button").style.display = "block";
                        document.querySelector(".waiting").style.display = "none";

                        document.querySelector(".slider").style.display = "block";
                        document.querySelector(".timer-slider").style.display = "block";
                        document.querySelector("#dropdown").style.display = "block";
                    }

                    // no one else sees the settings, etc.
                    else {
                        const hostPlayer = playerArray.find(p => p.player.host === true);
                        host = false;
                        changeDictionary(hostPlayer.player.dictionary);
                        difficulty = hostPlayer.player.difficulty;
                        document.querySelector(".difficulty p").textContent = "difficulty: " + difficulty;
                        timerTime = hostPlayer.player.timerTime;
                        document.querySelector(".timer-time p").textContent = "timer: " + timerTime + "s";
                        document.querySelector(".slider").style.display = "none";
                        document.querySelector(".timer-slider").style.display = "none";
                        document.querySelector("#dropdown").style.display = "none";
                        document.querySelector(".dictionaries p").textContent = "dictionary: " + document.querySelector("#dropdown").value;
                        textInput.focus();
                        textInput.value = "";
                        displayText.innerHTML = "";
                        document.querySelector(".play-button").style.display = "none";
                        document.querySelector(".waiting").style.display = "block";
                        // come back
                        update(selfPlayerRef, {
                            difficulty: hostPlayer.player.difficulty,
                            timerTime: hostPlayer.player.timerTime,
                            dictionary: hostPlayer.player.dictionary
                        })
                    }
                }
                
                // retrieve the startGame trigger from the database and start the game
                const hostPlayer = playerArray.find(p => p.player.host === true);
                if (hostPlayer.player.startGame === true) {
                    if (host === true) {
                        update(ref(db, "players/" + hostPlayer.playerKey), {
                            startGame: false
                        })
                    }
                    
                    startGame();
                }

                // retrieve the endGame trigger from the database and end the game
                if (hostPlayer.player.endGame === true) {
                    if (host === true) {
                        update(ref(db, "players/" + hostPlayer.playerKey), {
                            endGame: false
                        })
                    }
                    
                    endGame();
                }

                // retrieve the player's turn from the host
                playerTurn = hostPlayer.player.playerTurn;
                // get the index number of your player object in the playerArray
                const myPlayerIndex = playerArray.findIndex(player => player.playerKey === playerId);

                const playerTurnMessage = document.querySelector('.player-turn');
                // check if it's your turn
                if (gameOn === true) {
                    if (hostPlayer.player.playerTurn == myPlayerIndex) {
                        // if it's your turn, display it as so
                        textInput.style.display = "inline";
                        textInput.focus();
                        yourTurn = true;
                        if (resetTurnText === false) {
                            displayText.innerHTML = "";
                            resetTurnText = true;
                        }

                        playerTurnMessage.style.display = "none";
                        displayText.style.opacity = "1";
                        document.querySelector(".prompt-container").style.opacity = "1";

                        // this triggers once at the start of your turn
                        if (yourTurnTrigger === false) {
                            yourTurnTrigger = true;
                            
                            // if there is more than one player and you are alive, start the timer
                            if (playerArray.length > 1  && playerArray[myPlayerIndex].player.health > 0) {
                                textInput.value = "";
                                
                                // when the timer runs out, knock your health down and go to next player
                                turnTimer = setTimeout(function() {
                                    // next player's turn
                                    if (playerTurn >= playerArray.length - 1) {
                                        playerTurn = 0;
                                    }
                                    else {
                                        playerTurn ++;
                                    }

                                    // update the host variables with the player turn and prompt
                                    update(ref(db, "players/" + hostPlayer.playerKey), {
                                        playerTurn: playerTurn,
                                        prompt: prompt
                                    })

                                    // lower your health based on how difficult the bigram is. The easier the prompt, the more health you lose for not answering
                                    const promptIndex = bigrams.findIndex(row => row[0] === prompt);

                                    let newHealth = playerArray[myPlayerIndex].player.health - (bigrams.length - promptIndex) / 15;

                                    if (newHealth <= 0) {
                                        newHealth = 0;
                                    }
                                    
                                    update(selfPlayerRef, {
                                        typing: "",
                                        health: newHealth
                                    })

                                    loseHealth.play();
                                }, timerTime * 1000)
                            }
                            
                            // if the streak timer runs out, set your win streak back to 0
                            streakTimer = setTimeout(function() {
                                winStreak = 0;
                                update(selfPlayerRef, {
                                    winStreak: false
                                })
                            }, 5000)
                        }

                        // if you're dead, skip to the next player
                        else if (playerArray.length > 1 && playerArray[myPlayerIndex].player.health <= 0 && alivePlayers.length > 0) {
                            if (alivePlayers.length == 1) {
                                prompt = newPrompt();
                            }
                            // next player's turn
                            if (playerTurn >= playerArray.length - 1) {
                                playerTurn = 0;
                            }
                            else {
                                playerTurn ++;
                            }

                            // update the host variables with the player turn and prompt
                            update(ref(db, "players/" + hostPlayer.playerKey), {
                                playerTurn: playerTurn,
                                prompt: prompt
                            })
                        }
                    }
                    // if it's not your turn, display it as so
                    else {
                        textInput.style.display = "none";
                        yourTurn = false;
                        yourTurnTrigger = false;
                        clearTimeout(turnTimer);
                        clearTimeout(streakTimer);
                        displayText.innerHTML = playerArray[playerTurn].player.typing;
                        resetTurnText = false;
                        playerTurnMessage.innerHTML = playerArray[playerTurn].player.name + "\'s turn";
                        playerTurnMessage.style.display = "block";
                        displayText.style.opacity = "0.7";
                        document.querySelector(".prompt-container").style.opacity = "0.7";
                    }
                }
                

                // display the prompt you get from the host
                prompt = hostPlayer.player.prompt;
                document.querySelector('.prompt').textContent = prompt.toUpperCase();

                // if no more players are alive, end the game
                alivePlayers = playerArray.filter(player => player.player.health > 0);
                setTimeout(function() {
                    if (host === true && alivePlayers.length <= 0 && gameOn === true) {
                        update(selfPlayerRef, {
                            endGame: true
                        })
                    }
                }, 100)
            }
        })
        
        // only update the dictionary if you are the host
        document.querySelector("#dropdown").addEventListener("change", function () {
            if (host === true) {
                changeDictionary(this.value);
                sound1.play();

                saveStateHandler();

                // save the dictionary to your Firebase player node
                update(selfPlayerRef, {
                    dictionary: this.value
                })
            }
        })

        // update the difficulty based on the slider value
        document.querySelector(".slider").addEventListener("change", function () {
            if (host === true) {
                document.querySelector(".difficulty p").textContent = "difficulty: " + this.value;

                difficulty = this.value;
                sound1.play();

                saveStateHandler();

                // save the difficulty to your Firebase player node
                update(selfPlayerRef, {
                    difficulty: difficulty
                })
            }
        })

        // update the timer time based on the slider value
        document.querySelector(".timer-slider").addEventListener("change", function () {
            if (host === true) {
                document.querySelector(".timer-time p").textContent = "timer: " + this.value + "s";

                timerTime = this.value;
                sound1.play();

                saveStateHandler();

                // save the timer to your Firebase player node
                update(selfPlayerRef, {
                    timerTime: timerTime
                })
            }
        })

        // click the play button as the host to send the startGame trigger
        document.querySelector(".play-button").addEventListener("click", function() {
            if (host === true) {
                update(selfPlayerRef, {
                    startGame: true
                })

                sound2.play();
            }
        })

        // open and close the messages modal
        let messagesOpen = false;
        document.querySelector(".messages-button").addEventListener("click", function() {
            if (!messagesOpen) {
                document.querySelector(".messages-modal").style.right = "0vw";
                document.querySelector(".messages-button").style.right = "calc(30vw + 10px)";
                document.querySelector(".arrow").style.transform = "translate(-70%, -50%) rotate(-135deg)";
                messagesOpen = true;
            }
            else {
                document.querySelector(".messages-modal").style.right = "-33vw";
                document.querySelector(".messages-button").style.right = "30px";
                document.querySelector(".arrow").style.transform = "translate(-30%, -50%) rotate(45deg)";
                messagesOpen = false;
            }
        })

        // what happens when the game starts
        function startGame() {
            gameOn = true;
            document.querySelector(".slider").style.display = "none";
            document.querySelector(".timer-slider").style.display = "none";
            document.querySelector(".play-button").style.display = "none";
            document.querySelector(".waiting").style.display = "none";
            document.querySelector("#dropdown").style.display = "none";
            document.querySelector(".prompt-container").style.display = "flex";
            document.querySelector("#textInput").style.display = "inline";
            document.querySelector(".displayText").style.display = "inline";
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

            // reset and start playing
            if (host === true) {
                update(selfPlayerRef, {
                    prompt: prompt,
                    usedWords: [],
                    winStreak: 0
                })
            }

            update(selfPlayerRef, {
                health: 100,
                playing: true
            })
        }

        // what happens when the game ends
        function endGame() {
            gameOn = false;
            document.querySelector(".slider").style.display = "block";
            document.querySelector(".timer-slider").style.display = "block";
            document.querySelector(".play-button").style.display = "block";
            document.querySelector("#dropdown").style.display = "block";
            document.querySelector(".prompt-container").style.display = "none";
            document.querySelector("#textInput").style.display = "none";
            document.querySelector(".displayText").style.display = "none";
            document.querySelector(".dictionaries p").textContent = "dictionary: ";
            document.querySelector('.player-turn').style.display = "none";
            document.querySelector(".waiting").textContent = "Waiting for host to start";

            // if you were waiting in the lobby for someone's game to end, now your player is created and you join the game
            if (waiting === false) {
                update(selfPlayerRef, {
                    health: 100,
                    playing: false,
                })
            }
            else {
                setTimeout(function() {
                    waiting = false;
                    createPlayer();
                }, 300)
            }
            
            // reset turn
            playerTurn = 0
            if (host === true) {
                update(selfPlayerRef, {
                    playerTurn: 0
                })
            }
        }

        // focus the input when switching tabs
        document.addEventListener("visibilitychange", (event) => {
            if (document.visibilityState == "visible") {
                textInput.focus();
            }
        });

        // when the player types
        textInput.addEventListener("input", function() {
            // add a span tag around where the prompt appears in the typed answer so we can distinguish it
            let newHTML = this.value;
            let newHTML2 = newHTML.toLowerCase().replace(prompt, "<span>" + prompt + "</span>");
            // if it's your turn, send the typed text to Firebase
            if (yourTurn === true) {
                displayText.innerHTML = newHTML2;
                update(selfPlayerRef, {
                    typing: newHTML2
                })
            }
        })

        // send a join message to the chat when you join the game
        document.querySelector(".messages-button").style.display = "block";
        const joinMessageRef = push(messageRef);

        set(joinMessageRef, {
            name: name,
            status: "join",
            timestamp: serverTimestamp(),
            playerId: playerId
        });

        // send a new message in the chat
        document.querySelector("#messageInput").addEventListener("keydown", function (e) {
            if (e.which === 13 && this.value.length > 0) {
                const newMessageRef = push(messageRef);
                // send the message
                set(newMessageRef, {
                    name: name,
                    message: this.value,
                    timestamp: serverTimestamp(),
                    playerId: playerId
                });
                
                this.value = "";
            }
        })

        // when messages are added, update the messages display
        // let addedMessage;
        let messagesArray = [];
        onChildAdded(messageRef, (snapshot) => {

            // addedMessage = snapshot.val();

            messagesArray.push({
                messageId: snapshot.key,
                ...snapshot.val()
            });

            messagesArray.sort((a, b) => a.timestamp - b.timestamp);

            if (messagesArray.length > 50) {
                if (host == true) {
                    remove(ref(db, `messages/${messagesArray[0].messageId}`));
                }

                messagesArray.splice(0, 1);
            }

            document.querySelector(".messages").innerHTML = "";

            for (let i = 0; i < messagesArray.length; i++) {
                if (messagesArray[i].message && messagesArray[i].playerId !== playerId) {
                   document.querySelector(".messages").innerHTML = document.querySelector(".messages").innerHTML + "<div class='message'><b>" + messagesArray[i].name + ":</b> " + messagesArray[i].message + "</div>";
                }

                else if (messagesArray[i].message && messagesArray[i].playerId == playerId) {
                   document.querySelector(".messages").innerHTML = document.querySelector(".messages").innerHTML + "<div style='background-color: rgba(150, 150, 150, 0.2)' class='message your-message'><b>" + messagesArray[i].name + ":</b> " + messagesArray[i].message + "</div>";
                }

                else if (messagesArray[i].status == "join" && messagesArray[i].playerId !== playerId) {
                   document.querySelector(".messages").innerHTML = document.querySelector(".messages").innerHTML + "<div style='color: var(--tertiary)' class='message'><b>" + messagesArray[i].name + " has joined</b></div>";
                }

                else if (messagesArray[i].status == "leave") {
                   document.querySelector(".messages").innerHTML = document.querySelector(".messages").innerHTML + "<div style='color: var(--tertiary)' class='message'><b>" + messagesArray[i].name + " has left</b></div>";
                }
            }
            
            // always scroll to the most recent message
            document.querySelector(".messages").scrollTop = document.querySelector(".messages").scrollHeight;
        });

        let makeHostOpen = false;
        let clickedId;
        window.addEventListener("click", function(e) {
            const targetItem = e.target.closest('.player-item');

            const x = e.clientX;
            const y = e.clientY;

            if (targetItem && host == true) {
                if (!makeHostOpen) {
                    document.querySelector(".make-host").style.display = "block";
                    document.querySelector(".make-host").style.left = x + "px";
                    document.querySelector(".make-host").style.top = y + "px";
                    makeHostOpen = true;

                    clickedId = targetItem.id;
                }

                else {
                    document.querySelector(".make-host").style.display = "none";
                    makeHostOpen = false;
                }
            }
        })

        document.querySelector(".make-host").addEventListener("click", function() {
            if (clickedId && host == true && clickedId !== playerId) {
                document.querySelector(".make-host").style.display = "none";
                makeHostOpen = false;

                host = false;
                update(ref(db, "players/" + clickedId), {
                    host: true
                })
                
                update(selfPlayerRef, {
                    host: false
                })
            }
        })
    }

    // select which avatar you want on the main menu
    let elements = document.getElementsByClassName("avatar");

    function selectAvatar() {
        const attr = this.getAttribute("src");
        const attrSplit = attr.split("-");
        const avatarNum = attrSplit[1].replace(".png", "");
        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.remove("avatar-select")
        }
        this.classList.add("avatar-select");
        // global variable that is then set in your player node to reference later for displaying
        avatar = avatarNum;
    }

    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', selectAvatar);
    }

    // click play button to start
    document.querySelector(".join-button").addEventListener("click", function () {
        name = document.querySelector("#nameInput").value;
        if (name.length > 2) {
            joinGame();
        }

        sound2.play();
    })
    
    // hit enter in the input to start also
    document.querySelector("#nameInput").addEventListener("keydown", function (e) {
        if (e.which === 13) {
            name = document.querySelector("#nameInput").value;
            if (name.length > 2) {
                joinGame();
            }
        
            sound2.play();
        }
    })


    // make sure the text input is focused when clicking anywhere in the parent div
    document.querySelector(".gameplay").addEventListener("click", function () {
        textInput.focus();
    })


    // save game settings and coin amount
    function saveStateHandler() {
        
        // save the values to local storage if they are not default values
        if (coins !== 0) {
            localStorage.setItem("coins", coins);
        }

        if (difficulty !== 1) {
            localStorage.setItem("difficulty", difficulty);
        }

        if (timerTime !== 7) {
            localStorage.setItem("timerTime", timerTime);
        }

        if (document.querySelector("#dropdown").value) {
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
            document.querySelector(".coins p").innerHTML = "<span>coins: </span>" + coins;
        }
        
        let localDifficulty = Number(localStorage.getItem("difficulty"));
        if (localDifficulty !== 0) {
            difficulty = localDifficulty;
            document.querySelector(".difficulty p").textContent = "difficulty: " + difficulty;
            document.querySelector(".slider").value = difficulty;
        }

        let localTimerTime = Number(localStorage.getItem("timerTime"));
        if (localTimerTime !== 0) {
            timerTime = localTimerTime;
            document.querySelector(".timer-time p").textContent = "timer: " + timerTime + "s";
            document.querySelector(".timer-slider").value = timerTime;
        }
        
        let localDictionary = localStorage.getItem("dictionary");
        if (localDictionary) {
            changeDictionary(localDictionary);
            document.querySelector("#dropdown").value = localDictionary;
        }
        
        let localVolume = Number(localStorage.getItem("volume"));
        if (localVolume) {
            changeVolume(localVolume * 10)
            document.querySelector(".volume-slider").value = localVolume * 10;
        }
    }


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
                document.querySelector(".timer-slider").style.backgroundColor = "var(--secondary)";
                document.querySelector("select").style.backgroundColor = "var(--secondary)";
                document.querySelector("select").style.color = "var(--primary)";
                document.querySelector(".coins").style.color = "var(--secondary)";
                document.querySelector(".dictionaries").style.color = "var(--secondary)";
                document.querySelector(".difficulty").style.color = "var(--secondary)";
                document.querySelector(".timer-time").style.color = "var(--secondary)";
                document.querySelector("header").style.backgroundColor = "var(--primary)";
                settingsOpen = true;
            }, 5)
        }
        else {
            settings.style.transform = "translateY(-100vh)";
            document.querySelector(".slider").style.backgroundColor = "var(--primary)";
            document.querySelector(".timer-slider").style.backgroundColor = "var(--primary)";
            document.querySelector("select").style.backgroundColor = "var(--primary)";
            document.querySelector("select").style.color = "var(--secondary)";
            document.querySelector(".coins").style.color = "var(--primary)";
            document.querySelector(".dictionaries").style.color = "var(--primary)";
            document.querySelector(".difficulty").style.color = "var(--primary)";
            document.querySelector(".timer-time").style.color = "var(--primary)";
            document.querySelector("header").style.backgroundColor = "var(--secondary)";
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

    // randomize game colours easter egg
    document.querySelector(".colors").addEventListener("click", function () {
        const color1 = "hsl(" + Math.floor(Math.random() * 360) + 1 + ", 100%, 87%)";
        const color2 = "hsl(" + Math.floor(Math.random() * 360) + 1 + ", 74%, 12%)";
        const color3 = "hsl(" + Math.floor(Math.random() * 360) + 1 + ", 68%, 51%)";

        document.documentElement.style.setProperty("--primary", color1);
        document.documentElement.style.setProperty("--secondary", color2);
        document.documentElement.style.setProperty("--tertiary", color3);
    })
}