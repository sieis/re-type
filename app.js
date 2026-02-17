// State variables
let passages = [];
let currentPassage = null;
let timerInterval = null;
let startTime = null;
let isTyping = false;
// --- Session timer state ---
let sessionTimerStarted = false;
let sessionStartMs = null;
let sessionInterval = null;


// DOM elements
const passageSelector = document.getElementById('passageSelector');
const referenceText = document.getElementById('referenceText');
const userInput = document.getElementById('userInput');
const timerDisplay = document.getElementById('timer');
const wpmDisplay = document.getElementById('wpm');

// Load passages from JSON
async function loadPassages() {
    try {
        const response = await fetch('passages.json');
        passages = await response.json();
        populateSelector();
        loadPassage(0);
    } catch (error) {
        console.error('Error loading passages:', error);
    }
}

// Populate the passage selector dropdown
function populateSelector() {
    passageSelector.innerHTML = '';
    passages.forEach((passage, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = passage.title;
        passageSelector.appendChild(option);
    });
}

// Load a specific passage
function loadPassage(index) {
    currentPassage = passages[index];
    displayReferenceText();
    resetTypingSession();
}

// Display reference text with highlighting
function displayReferenceText() {
    referenceText.innerHTML = '';
    const text = currentPassage.passage;
    
    for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.textContent = text[i];
        span.id = `char-${i}`;
        referenceText.appendChild(span);
    }
}

// Reset typing session
function resetTypingSession() {
    userInput.value = '';
    isTyping = false;
    startTime = null;
    clearInterval(timerInterval);
    timerDisplay.textContent = '0.0s';
    wpmDisplay.textContent = '0';
    displayReferenceText();
    userInput.focus();
}

// Start timer
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        timerDisplay.textContent = elapsed.toFixed(1) + 's';
    }, 100);
}

// --- Start session timer (runs until page refresh), aligned to real seconds ---
function startSessionTimer() {
  if (sessionTimerStarted) return;

  sessionTimerStarted = true;
  sessionStartMs = Date.now();

  const sessionDisplay = document.getElementById('sessionTimerValue');
  if (!sessionDisplay) return;

  const update = () => {
    const elapsedMs = Date.now() - sessionStartMs;
    const elapsedSec = Math.floor(elapsedMs / 1000);

    const minutes = Math.floor(elapsedSec / 60);
    const seconds = elapsedSec % 60;

    sessionDisplay.textContent =
      String(minutes).padStart(2, '0') + ':' +
      String(seconds).padStart(2, '0');

    // Schedule next update exactly at the next second boundary
    const msToNextSecond = 1000 - (elapsedMs % 1000);
    sessionInterval = setTimeout(update, msToNextSecond);
  };

  update();
}



// Stop timer and calculate WPM
function stopTimer() {
    clearInterval(timerInterval);
    const elapsed = (Date.now() - startTime) / 1000;
    const minutes = elapsed / 60;
    const wordCount = currentPassage.passage.trim().split(/\s+/).length;
    const wpm = Math.round(wordCount / minutes);
    wpmDisplay.textContent = wpm;
}

// Update highlighting based on user input
function updateHighlighting() {
    const typed = userInput.value;
    const reference = currentPassage.passage;

    // Start timers on first keystroke
    if (!isTyping && typed.length > 0) {
        isTyping = true;
        startTimer();
        startSessionTimer(); // <-- ADD THIS LINE
    }




            // Highlight characters
        for (let i = 0; i < reference.length; i++) {
            const charElement = document.getElementById(`char-${i}`);
            
            // Always highlight the current cursor position
            if (i === userInput.selectionStart) {
                charElement.style.backgroundColor = '#fef08a'; // Light yellow
            } else {
                charElement.style.backgroundColor = '';
            }
            
            if (i < typed.length) {
                if (typed[i] === reference[i]) {
                    charElement.style.color = 'green';
                    charElement.style.fontWeight = 'bold';
                } else {
                    charElement.style.color = 'red';
                    charElement.style.fontWeight = 'bold';
                }
            } else {
                charElement.style.color = '';
                charElement.style.fontWeight = '';
            }
        }


    // Check if passage is complete
    if (typed === reference) {
        stopTimer();
    }
}

// Event listeners
passageSelector.addEventListener('change', (e) => {
    loadPassage(parseInt(e.target.value));
});


userInput.addEventListener('input', updateHighlighting);
userInput.addEventListener('click', updateHighlighting);
userInput.addEventListener('keyup', updateHighlighting);
userInput.addEventListener('paste', (e) => {
    e.preventDefault();
});

// Navigation button event listeners
document.getElementById('prevButton').addEventListener('click', () => {
    const currentIndex = parseInt(passageSelector.value);
    const newIndex = currentIndex === 0 ? passages.length - 1 : currentIndex - 1;
    passageSelector.value = newIndex;
    loadPassage(newIndex);
});

document.getElementById('nextButton').addEventListener('click', () => {
    const currentIndex = parseInt(passageSelector.value);
    const newIndex = (currentIndex + 1) % passages.length;
    passageSelector.value = newIndex;
    loadPassage(newIndex);
});

document.getElementById('resetButton').addEventListener('click', () => {
    resetTypingSession();
});

// Initialize app
loadPassages();