// js/chess-solitaire-sound.js

// Ensure Tone.js is loaded before this script runs (or check for its existence)
let correctSound, wrongSound, winSound;
let soundsReady = false;

/**
 * Initializes the sound synthesizers.
 * Should be called after Tone.js is loaded, ideally once the user interacts or Tone.start() is called.
 */
function initializeSounds() {
    if (typeof Tone === 'undefined') {
        console.error("Tone.js is not loaded. Cannot initialize sounds.");
        return;
    }
    if (soundsReady) return; // Already initialized

    try {
        correctSound = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.2 }
        }).toDestination();

        wrongSound = new Tone.Synth({
            oscillator: { type: 'square' },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.2 }
        }).toDestination();

        winSound = new Tone.PluckSynth().toDestination();
        soundsReady = true;
        console.log("Sounds initialized successfully.");
    } catch (error) {
        console.error("Error initializing Tone.js sounds:", error);
        soundsReady = false; // Ensure flag is correct on error
    }
}

/**
 * Attempts to start the Tone.js audio context (often required by browsers before playing sound).
 */
async function startAudioContext() {
    if (typeof Tone === 'undefined') return;
    await Tone.start();
    console.log('Audio context started');
    initializeSounds(); // Initialize sounds after context is started
}

/** Plays the sound for a correct move. */
export function playCorrectSound() {
    if (!soundsReady) initializeSounds(); // Attempt lazy init
    if (correctSound) {
        correctSound.triggerAttackRelease("C4", "8n", Tone.now());
    } else {
        console.warn("Correct sound not ready.");
    }
}

/** Plays the sound for an incorrect move. */
export function playWrongSound() {
    if (!soundsReady) initializeSounds();
    if (wrongSound) {
        wrongSound.triggerAttackRelease("G3", "4n", Tone.now()); // Lowered pitch
    } else {
        console.warn("Wrong sound not ready.");
    }
}

/** Plays the winning sound sequence. */
export function playWinSound() {
    if (!soundsReady) initializeSounds();
    if (winSound) {
        const now = Tone.now();
        winSound.triggerAttackRelease("C4", "8n", now);
        winSound.triggerAttackRelease("E4", "8n", now + 0.15); // Adjusted timing
        winSound.triggerAttackRelease("G4", "8n", now + 0.3);
        winSound.triggerAttackRelease("C5", "2n", now + 0.45); // Shorter final note
    } else {
        console.warn("Win sound not ready.");
    }
}

// Call this function early, perhaps on first user interaction or page load
// We'll call it from app.js on load for simplicity here.
export { startAudioContext };