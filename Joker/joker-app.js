// js/app.js - Main application logic and event binding

// Import necessary functions and variables from other modules
import { createCards } from './joker-deck.js';
import {
    displayCards,
    setMarkingMode,
    resetCurrentGuesses,
    boardSizeSelect,     // Need reference for value and event listener
    markingModeCheckbox, // Need reference for value and event listener
    resetButton,         // Need reference for event listener
    winMessage           // Need reference to hide it
} from './joker-ui.js';

/**
 * Resets the entire game state to start a new game.
 * Creates a new deck, displays cards, resets UI elements.
 */
function resetGame() {
    console.log("Resetting game..."); // For debugging

    // 1. Create a new deck based on the selected size
    createCards(+boardSizeSelect.value); // '+' converts value to number

    // 2. Display the new cards (this also adds event listeners)
    displayCards();

    // 3. Reset UI elements
    winMessage.style.display = 'none'; // Hide win message
    resetCurrentGuesses();             // Reset the counter in ui.js
    setMarkingMode(markingModeCheckbox.checked); // Sync marking mode state
    // Remove any 'marked' visual style from previous game
    document.querySelectorAll('.card.marked').forEach(c => c.classList.remove('marked'));

    console.log("Game reset complete."); // For debugging
}

// --- Event Listener Setup ---

// Reset button click
if (resetButton) {
    resetButton.addEventListener('click', resetGame);
} else {
    console.error("Reset button not found!");
}

// Board size change
if (boardSizeSelect) {
    boardSizeSelect.addEventListener('change', resetGame);
} else {
    console.error("Board size select element not found!");
}

// Marking mode checkbox change
if (markingModeCheckbox) {
    markingModeCheckbox.addEventListener('change', () => {
        setMarkingMode(markingModeCheckbox.checked);
    });
} else {
    console.error("Marking mode checkbox not found!");
}


// Keyboard listener for Spacebar to toggle marking mode
document.addEventListener('keydown', (event) => {
    // Ignore if typing in an input or select element
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT')) {
        return;
    }

    // Check for Spacebar (more robust check)
    if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault(); // Prevent default spacebar action (e.g., scrolling)
        if (markingModeCheckbox) {
             // Toggle the checkbox state
             markingModeCheckbox.checked = !markingModeCheckbox.checked;
             // Update the application's marking mode state
             setMarkingMode(markingModeCheckbox.checked);
        }
    }
});


// --- Initial Game Setup ---
console.log("Initializing application..."); // For debugging
resetGame();       // Setup the first game
console.log("Application initialized."); // For debugging