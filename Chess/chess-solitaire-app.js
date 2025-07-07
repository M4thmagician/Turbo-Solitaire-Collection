// js/chess-solitaire-app.js
import { startAudioContext } from './chess-solitaire-sound.js';
import { createBoard, setGridSize } from './chess-solitaire-board.js';
import { renderBoard, resetUiState, setMarkMode, setBlockMode, showMessage } from './chess-solitaire-ui.js';

// --- Constants ---
const boardSizeOptions = [9, 16, 25, 36, 49, 64]; // Valid board sizes (squares)
const defaultBoardSize = 16;

// --- DOM Elements ---
const resetButton = document.getElementById('reset-button');
const boardSizeSelect = document.getElementById('board-size-select');
const boardSizeValueDisplay = document.getElementById('board-size-value');
const markModeCheckbox = document.getElementById('mark-mode-checkbox');
const markModeLabel = document.getElementById('mark-mode-label');
const blockModeCheckbox = document.getElementById('block-mode-checkbox');
const blockModeLabel = document.getElementById('block-mode-label');

// --- Function Definitions ---

/** Initializes the game controls and state. */
function initializeGame() {
    console.log("Initializing Chess Solitaire...");

    // Attempt to initialize audio context early
    startAudioContext(); // Doesn't hurt to call early

    // Populate board size dropdown
    if (boardSizeSelect) {
        boardSizeOptions.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            const dim = Math.sqrt(size);
            option.textContent = `${size} (${dim}x${dim})`;
            boardSizeSelect.appendChild(option);
        });
        boardSizeSelect.value = defaultBoardSize; // Set default selection
        updateBoardSizeDisplay(defaultBoardSize);
    } else {
        console.error("Board size select element not found!");
    }

    // Add event listeners
    setupEventListeners();

    // Create the initial board
    resetGame(); // Call resetGame to set up the first board

    console.log("Chess Solitaire Initialized.");
}

/** Sets up all the necessary event listeners for controls. */
function setupEventListeners() {
    // Reset Button
    if (resetButton) {
        resetButton.addEventListener('click', resetGame);
    } else {
        console.error("Reset button not found!");
    }

    // Board Size Selector
    if (boardSizeSelect) {
        boardSizeSelect.addEventListener('change', handleBoardSizeChange);
    }

    // Mark Mode Checkbox and Label
    if (markModeCheckbox && markModeLabel) {
        markModeCheckbox.addEventListener('change', handleMarkModeToggle);
        markModeLabel.addEventListener('click', () => toggleCheckbox(markModeCheckbox));
    }

    // Block Mode Checkbox and Label
    if (blockModeCheckbox && blockModeLabel) {
        blockModeCheckbox.addEventListener('change', handleBlockModeToggle);
        blockModeLabel.addEventListener('click', () => toggleCheckbox(blockModeCheckbox));
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', handleKeyPress);
}

/** Resets the game to its initial state. */
function resetGame() {
    console.log("Resetting game via app...");
    const currentSize = boardSizeSelect ? parseInt(boardSizeSelect.value) : defaultBoardSize;
    const gridSize = Math.sqrt(currentSize);

    setGridSize(gridSize); // Update board module's grid size
    resetUiState();       // Reset UI elements and state
    createBoard();        // Create new board data
    renderBoard();        // Draw the board
    showMessage("New game started. Find the King!"); // Initial message

    // Ensure checkboxes reflect the reset state (off)
    if (markModeCheckbox) markModeCheckbox.checked = false;
    if (blockModeCheckbox) blockModeCheckbox.checked = false;
    setMarkMode(false);
    setBlockMode(false);
}

/** Handles changes to the board size select dropdown. */
function handleBoardSizeChange() {
    const newSize = parseInt(this.value);
    updateBoardSizeDisplay(newSize);
    resetGame(); // Changing size resets the game
}

/** Handles toggling the mark mode checkbox. */
function handleMarkModeToggle() {
    const isMarking = this.checked;
    setMarkMode(isMarking);
    if (isMarking && blockModeCheckbox) {
        blockModeCheckbox.checked = false; // Uncheck blocking mode
        setBlockMode(false);
    }
    renderBoard(); // Re-render to apply/remove hover styles
}

/** Handles toggling the block mode checkbox. */
function handleBlockModeToggle() {
    const isBlocking = this.checked;
    setBlockMode(isBlocking);
    if (isBlocking && markModeCheckbox) {
        markModeCheckbox.checked = false; // Uncheck marking mode
        setMarkMode(false);
    }
    renderBoard(); // Re-render to apply/remove hover styles
}

/** Handles keyboard presses for shortcuts. */
function handleKeyPress(event) {
     // Ignore if typing in input/select
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT')) {
        return;
    }

    if (event.code === 'Space') {
        event.preventDefault(); // Prevent page scroll
        toggleCheckbox(markModeCheckbox); // Toggle marking
    } else if (event.key === 'Shift' || event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        // Note: Holding shift triggers multiple keydown events. Checkbox handles state.
        // We can toggle on keydown for responsiveness.
        event.preventDefault();
         toggleCheckbox(blockModeCheckbox); // Toggle blocking
    }
}

/** Helper function to toggle a checkbox and trigger its change event. */
function toggleCheckbox(checkbox) {
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        // Manually dispatch a change event so the listener fires
        checkbox.dispatchEvent(new Event('change'));
    }
}

/** Updates the text display for the current board size. */
function updateBoardSizeDisplay(boardSize) {
    if (boardSizeValueDisplay) {
        const gridSize = Math.sqrt(boardSize);
        boardSizeValueDisplay.textContent = `Board Size: ${boardSize} (${gridSize}x${gridSize})`;
    }
}


// --- Start the application ---
// Use DOMContentLoaded to ensure HTML is ready before running JS
document.addEventListener('DOMContentLoaded', initializeGame);