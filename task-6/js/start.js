window.onload = go_all_stuff;

// 1. GLOBAL VARIABLES: These must be outside the functions so 
// the animationLoop can access them.
let audioContext;
let analyser;
let dataArray;
let microphoneSetup = false;

async function getMicrophoneInput() {
  console.log("Attempting to start Microphone...");
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContext(); 

  try {
    let audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Resume context (required by browsers to play/analyze audio)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    let microphoneIn = audioContext.createMediaStreamSource(audioStream);
    analyser = audioContext.createAnalyser();
    
    // We use a small fftSize for better real-time volume reactivity
    analyser.fftSize = 64; 
    microphoneIn.connect(analyser);

    // Initialize the dataArray that the animationLoop will read from
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    microphoneSetup = true; 
    console.log("Microphone is LIVE");
  } catch (err) {
    console.log("Error getting microphone:", err);
  }
}

function go_all_stuff() {
  let videoEl = document.getElementById("video-birds");

  // 2. USER GESTURE: Browser security requires a click to start Audio/Video
  window.addEventListener("click", function() {
    if (videoEl.currentTime === 0) {
      videoEl.play();
    }
    
    // Start mic only once on the first click
    if (!microphoneSetup) {
      getMicrophoneInput();
    }
  });

  videoEl.loop = true;

  // Setup Canvases and DrawingBoards
  let theCanvases = document.querySelectorAll(".canvases");
  let theContexts = [];
  for (let i = 0; i < theCanvases.length; i++) {
    theContexts.push(theCanvases[i].getContext("2d"));
  }

  let drawingBoardA = new DrawingBoard(theCanvases[0], theContexts[0], theCanvases[0].id);
  drawingBoardA.addObj(new CircularObj(100, 100, 20, "#FFC300", "#E6E6FA", drawingBoardA.context));

  let drawingBoardB = new DrawingBoard(theCanvases[1], theContexts[1], theCanvases[1].id);
  drawingBoardB.addObj(new RectangularObj(100, 100, 50, 70, "#FF5733", "#E6E6FA", drawingBoardB.context));

  let drawingBoardC = new DrawingBoard(theCanvases[2], theContexts[2], theCanvases[2].id);
  drawingBoardC.addObj(new FreeStyleObj(10, 100, 300, "#CF9FFF", "#CF9FFF", drawingBoardC.context));

  let drawingBoardD = new DrawingBoard(theCanvases[3], theContexts[3], theCanvases[3].id);
  drawingBoardD.addObj(new VideoObj(0, 0, 400, 300, videoEl, drawingBoardD.context));

  // 3. START THE LOOP
  window.requestAnimationFrame(animationLoop);

  function animationLoop() {
    let volume = 0;

    // Check if the mic is actually ready before asking for data
    if (microphoneSetup && analyser) {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      volume = sum / dataArray.length;
    }

    // Update all boards with the calculated volume
    drawingBoardA.animate(volume); 
    drawingBoardB.animate(volume); // Updates Rectangle width/height/color
    drawingBoardC.animate(volume); // Updates Wave speed/color
    drawingBoardD.run(videoEl);
    
    window.requestAnimationFrame(animationLoop);
  }
}