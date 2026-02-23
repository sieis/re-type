// State variables
let passages = [];
let currentPassage = null;
let timerInterval = null;
let startTime = null;
let isTyping = false;
// --- Session timer state ---
let sessionTimerStarted = false;
let sessionTimerPaused = false;
let sessionStartMs = null;
let sessionPausedTime = 0; // Time accumulated before pause
let sessionInterval = null;
// --- Font size state ---
let fontSizeMultiplier = 1;
const MIN_MULTIPLIER = 0.8;
const MAX_MULTIPLIER = 1.5;
const MULTIPLIER_STEP = 0.1;
// --- Hard mode state ---
let hardModeEnabled = false;


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
    // Show reference text only if hard mode is off
    if (!hardModeEnabled) {
        referenceText.style.display = 'block';
    }
    // userInput.focus();
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
  if (sessionTimerStarted && !sessionTimerPaused) return;

  if (!sessionTimerStarted) {
    sessionTimerStarted = true;
    sessionStartMs = Date.now();
    sessionPausedTime = 0;
  } else if (sessionTimerPaused) {
    // Resume from pause
    sessionTimerPaused = false;
    sessionStartMs = Date.now() - sessionPausedTime;
  }

  updateSessionButtonStates();

  const sessionDisplay = document.getElementById('sessionTimerValue');
  if (!sessionDisplay) return;

  const update = () => {
    if (sessionTimerPaused) return;
    
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

function pauseSessionTimer() {
  if (!sessionTimerStarted || sessionTimerPaused) return;
  
  sessionTimerPaused = true;
  const elapsedMs = Date.now() - sessionStartMs;
  sessionPausedTime = elapsedMs;
  clearTimeout(sessionInterval);
  updateSessionButtonStates();
}

function stopSessionTimer() {
  sessionTimerStarted = false;
  sessionTimerPaused = false;
  sessionPausedTime = 0;
  clearTimeout(sessionInterval);
  document.getElementById('sessionTimerValue').textContent = '00:00';
  updateSessionButtonStates();
}

function resetSessionTimer() {
  stopSessionTimer();
}

function updateSessionButtonStates() {
  const startBtn = document.getElementById('startSessionBtn');
  const pauseBtn = document.getElementById('pauseSessionBtn');
  
  if (!startBtn || !pauseBtn) return;
  
  if (!sessionTimerStarted) {
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  } else if (sessionTimerPaused) {
    startBtn.disabled = false;
    startBtn.textContent = 'Resume';
    pauseBtn.disabled = true;
  } else {
    startBtn.disabled = true;
    startBtn.textContent = 'Start';
    pauseBtn.disabled = false;
  }
}

// --- Old session timer code (kept for reference, now replaced above) ---
/*
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
*/



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
            
            if (i < typed.length) {
                if (typed[i] === reference[i]) {
                    charElement.style.color = 'green';
                    charElement.style.fontWeight = 'bold';
                } else {
                    charElement.style.color = 'red';
                    charElement.style.fontWeight = 'bold';
                    // Highlight spaces with red background when they're incorrect
                    if (reference[i] === ' ') {
                        charElement.style.backgroundColor = '#ff6464';
                    }
                }
            } else {
                charElement.style.color = '';
                charElement.style.fontWeight = '';
            }
            
            // Always highlight the current cursor position (overrides other backgrounds)
            if (i === userInput.selectionStart) {
                charElement.style.backgroundColor = '#fef08a'; // Light yellow
                // If character hasn't been typed yet, make text black for readability
                if (i >= typed.length) {
                    charElement.style.color = '#000000';
                }
            } else if (!(i < typed.length && typed[i] !== reference[i] && reference[i] === ' ')) {
                // Only clear background if this isn't an incorrect space
                charElement.style.backgroundColor = '';
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

// Font size management
function loadFontSize() {
    const saved = localStorage.getItem('fontSizeMultiplier');
    if (saved) {
        fontSizeMultiplier = parseFloat(saved);
    }
    applyFontSize();
}

function applyFontSize() {
    const passageSelector = document.getElementById('passageSelector');
    const referenceText = document.getElementById('referenceText');
    const userInput = document.getElementById('userInput');
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    
    if (passageSelector) {
        passageSelector.style.fontSize = (15 * fontSizeMultiplier) + 'px';
    }
    if (referenceText) {
        referenceText.style.fontSize = (16 * fontSizeMultiplier) + 'px';
    }
    if (userInput) {
        userInput.style.fontSize = (16 * fontSizeMultiplier) + 'px';
    }
    if (fontSizeDisplay) {
        fontSizeDisplay.textContent = Math.round(fontSizeMultiplier * 100) + '%';
    }
    
    localStorage.setItem('fontSizeMultiplier', fontSizeMultiplier);
}

function increaseFontSize() {
    if (fontSizeMultiplier < MAX_MULTIPLIER) {
        fontSizeMultiplier += MULTIPLIER_STEP;
        applyFontSize();
    }
}

function decreaseFontSize() {
    if (fontSizeMultiplier > MIN_MULTIPLIER) {
        fontSizeMultiplier -= MULTIPLIER_STEP;
        applyFontSize();
    }
}

function toggleHardMode() {
    hardModeEnabled = !hardModeEnabled;
    localStorage.setItem('hardModeEnabled', hardModeEnabled);
    updateHardModeDisplay();
    
    // Immediately hide or show reference text based on hard mode state
    if (hardModeEnabled) {
        referenceText.style.display = 'none';
    } else {
        referenceText.style.display = 'block';
    }
}

function updateHardModeDisplay() {
    const toggle = document.getElementById('hardModeToggle');
    if (toggle) {
        toggle.textContent = hardModeEnabled ? 'Hard Mode: ON' : 'Hard Mode: OFF';
        toggle.style.backgroundColor = hardModeEnabled ? 'rgba(108, 92, 231, 0.3)' : '';
    }
}

function loadHardMode() {
    const saved = localStorage.getItem('hardModeEnabled');
    hardModeEnabled = saved === 'true';
    updateHardModeDisplay();
    
    // Apply display state based on hard mode
    if (hardModeEnabled) {
        referenceText.style.display = 'none';
    } else {
        referenceText.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('increaseFont').addEventListener('click', increaseFontSize);
    document.getElementById('decreaseFont').addEventListener('click', decreaseFontSize);
    document.getElementById('hardModeToggle').addEventListener('click', toggleHardMode);
    
    // Session timer controls
    document.getElementById('startSessionBtn').addEventListener('click', startSessionTimer);
    document.getElementById('pauseSessionBtn').addEventListener('click', pauseSessionTimer);
    document.getElementById('resetSessionBtn').addEventListener('click', resetSessionTimer);
    
    updateSessionButtonStates();
});

// Initialize app
loadPassages();
loadFontSize();
loadHardMode();