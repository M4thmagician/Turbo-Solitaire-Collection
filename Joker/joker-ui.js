// js/ui.js
// Import from deck module
import { cards, gridSize, jokerIndex } from './joker-deck.js';
// Import the NEW central stats update function
import { updateStat } from '../Stats/stats-manager.js'; // Adjust path ../js/ if needed

// --- DOM Element References ---
// References related to the old stats system are REMOVED
export const cardGrid           = document.getElementById('card-grid');
export const winMessage         = document.querySelector('.win-message');
export const resetButton        = document.querySelector('.reset-button');
export const boardSizeSelect    = document.getElementById('board-size-select');
export const markingModeCheckbox= document.getElementById('marking-mode-checkbox');
// REMOVED: const freqList = document.getElementById('guess-frequencies');
// REMOVED: const avgDisplay = document.getElementById('average-guesses');

// --- UI State Variables ---
let markingMode = false;
let currentGuesses = 0; // Still needed to count guesses for the current game

// --- UI Functions ---

/**
 * Clears the grid and displays the current cards from the deck module.
 * Attaches necessary event listeners to each card.
 */
export function displayCards() {
    // Ensure cardGrid exists (good practice)
    if (!cardGrid) {
        console.error("Card grid element not found!");
        return;
    }

    cardGrid.innerHTML = ''; // Clear the grid
    cardGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`; // Set number of columns

    // Only loop up to the actual number of cards defined
    for (let i = 0; i < cards.length; i++) {
        const card = document.createElement('div');
        card.className = 'card'; // Use className for initial setup
        card.dataset.index = i;

        const cardFront = document.createElement('div');
        cardFront.className = 'card-face card-front';
        card.appendChild(cardFront);

        const cardBack = document.createElement('div');
        cardBack.className = 'card-face card-back';
        // Content set upon flip
        card.appendChild(cardBack);

        // Add event listeners (using consistent handler name)
        card.addEventListener('click', handleCardClick);
        card.addEventListener('mouseenter', handleCardMouseEnter);
        card.addEventListener('mouseleave', handleCardMouseLeave);
        cardGrid.appendChild(card);
    }
}

// REMOVED: function updateStatsDisplay() { ... } - This function is no longer needed here.

/** Handles mouse entering a card element. */
// Renamed for clarity
export function handleCardMouseEnter() {
    // Don't jiggle if flipped
    if (this.classList.contains('flipped')) return;

    if (markingMode) {
        this.classList.add('marking-mode-hover');
    } else {
        this.classList.add('jiggle');
    }
}

/** Handles mouse leaving a card element. */
// Renamed for clarity
export function handleCardMouseLeave() {
    this.classList.remove('marking-mode-hover', 'jiggle');
}

/** Handles clicking on a card. */
// Renamed for clarity
function handleCardClick() {
    const card = this; // The clicked card element
    const index = parseInt(card.dataset.index);

    // Ignore clicks on already flipped cards or outside the logical card range
    if (card.classList.contains('flipped') || isNaN(index) || index >= cards.length) return;

    if (markingMode) {
        // Toggle a marking class
        card.classList.toggle('marked');
        return; // Don't flip in marking mode
    }

    // --- Normal Flip ---
    card.classList.add('flipped'); // Trigger CSS flip animation
    card.classList.remove('jiggle'); // Stop jiggling when flipped

    const backFace = card.querySelector('.card-back');
    if (!backFace) return; // Safety check

    currentGuesses++; // Increment guess counter for this game

    // --- Check Win Condition ---
    if (cards[index] === 'Joker') {
        backFace.textContent = 'Joker'; // Show Joker text
        winMessage.style.display = 'block'; // Show win message

        // Disable further clicks after finding Joker
        document.querySelectorAll('.card').forEach(c => {
            c.removeEventListener('click', handleCardClick); // Use consistent handler name
            c.classList.remove('jiggle'); // Ensure no jiggling on win
        });

        // --- Update Central Statistics ---
        const boardSizeValue = gridSize * gridSize; // Calculate total cards (e.g., 9, 16)
        updateStat('jokerHunt', boardSizeValue, currentGuesses); // Call the NEW manager function
        // REMOVED: updateStatsDisplay(); - No display update here anymore

        currentGuesses = 0; // Reset counter for the *next* game (triggered by reset button)

    } else {
        // Not the Joker - Calculate and display Manhattan distance
        const jokerRow = Math.floor(jokerIndex / gridSize);
        const jokerCol = jokerIndex % gridSize;
        const cardRow = Math.floor(index / gridSize);
        const cardCol = index % gridSize;
        const distance = Math.abs(jokerRow - cardRow) + Math.abs(jokerCol - cardCol);
        backFace.textContent = distance; // Show distance number
    }
}

/** Sets the internal marking mode state. */
export function setMarkingMode(flag) {
    markingMode = flag;
    // Remove marking hover from all cards when mode changes
    if (!flag && cardGrid) { // Add safety check for cardGrid
        cardGrid.querySelectorAll('.card.marking-mode-hover').forEach(c => c.classList.remove('marking-mode-hover'));
    }
    // Maybe call renderBoard here if hover class logic needs full refresh?
}

/** Resets the guess counter for the current game (called by app.js resetGame). */
export function resetCurrentGuesses() {
    currentGuesses = 0;
}