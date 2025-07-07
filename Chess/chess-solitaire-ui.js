// js/chess-solitaire-ui.js
import { getBoard, getGridSize, getKingPosition } from './chess-solitaire-board.js';
import { playCorrectSound, playWrongSound, playWinSound } from './chess-solitaire-sound.js';
// Import the NEW central stats update function
import { updateStat } from '../Stats/stats-manager.js'; // Adjust path ../js/ if needed

// --- DOM Elements ---
const boardElement = document.getElementById('game-board');
// **** FIXED ID HERE ****
const messageBox = document.getElementById('message-box'); // <-- Correct ID
// We'll create the overlay dynamically if needed

// --- UI State (Managed within this module) ---
let flippedCards = []; // Array of { row: number, col: number }
let markedCards = []; // Array of { row: number, col: number }
let blockedCards = []; // Array of { row: number, col: number }
let markMode = false;
let blockMode = false;
let gameOver = false;
let totalCards = 0;
let currentFlips = 0; // Counter for flips in current game

// --- Exported Functions ---

/** Resets the UI state for a new game. */
export function resetUiState() {
    flippedCards = [];
    markedCards = [];
    blockedCards = [];
    // markMode and blockMode are controlled by checkboxes, don't reset here
    gameOver = false;
    currentFlips = 0; // Reset flip counter
    if (messageBox) messageBox.textContent = ''; // Clear message
    // Remove any existing game over overlay
    document.querySelector('.game-over-overlay')?.remove();
}

/** Sets the marking mode state. */
export function setMarkMode(isMarking) {
    markMode = isMarking;
    if (isMarking) blockMode = false; // Marking disables blocking
    updateHoverStyles(); // Update hover indicators
}

/** Sets the blocking mode state. */
export function setBlockMode(isBlocking) {
    blockMode = isBlocking;
    if (isBlocking) markMode = false; // Blocking disables marking
    updateHoverStyles(); // Update hover indicators
}

/**
 * Renders the current board state to the HTML.
 */
export function renderBoard() {
    if (!boardElement) {
        console.error("Game board element not found!");
        return;
    }

    const board = getBoard(); // Get current board data
    const gridSize = getGridSize();
    totalCards = gridSize * gridSize; // Update total cards count

    // Set the CSS variable for the checkerboard background pattern size
    boardElement.style.setProperty('--grid-dim', gridSize);

    boardElement.innerHTML = ''; // Clear previous board
    boardElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    boardElement.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.row = row; // Store row/col for click handler
            card.dataset.col = col;

            const isFlipped = flippedCards.some(c => c.row === row && c.col === col);
            const isMarked = markedCards.some(c => c.row === row && c.col === col);
            const isBlocked = blockedCards.some(c => c.row === row && c.col === col);

            // --- Apply Classes based on State ---
            if (isFlipped) {
                 card.classList.add('face-up');
                 // Display piece type if flipped
                 const piece = board[row]?.[col]; // Safely access board element
                 card.textContent = piece === '-' ? '' : piece; // Show piece or nothing if empty reveal
                 // Check if it's the *already won* King card for correct styling on re-render
                 if (piece === 'K' && gameOver) {
                    card.classList.add('correct');
                 }
            } else {
                card.textContent = ' '; // Use space for face-down
            }

            if (isMarked) card.classList.add('marked');
            if (isBlocked) card.classList.add('blocked');

            // Add hover indicators based on current mode (only if not flipped/blocked)
            if (!isFlipped && !isBlocked) {
                if (markMode) card.classList.add('mark-hover');
                if (blockMode) card.classList.add('block-hover');
            }

            // Attach click listener (use internal handler)
            card.addEventListener('click', internalHandleCardClick);
            boardElement.appendChild(card);
        }
    }
}

/** Shows a message to the user. */
export function showMessage(message) {
    // **** CHECK IF messageBox EXISTS BEFORE USING IT ****
    if (messageBox) {
        messageBox.textContent = message;
    } else {
        // Fallback or error if the message box isn't found (shouldn't happen with fixed ID)
        console.error("Message box element not found!");
    }
}

// --- Internal Event Handlers & Helpers ---

/** Internal handler that calls the main logic function */
function internalHandleCardClick() {
    handleCardClickLogic(this); // Pass the clicked element
}

/** Main logic for handling a card click. */
function handleCardClickLogic(cardElement) { // Accept the card element
    if (gameOver) return; // Ignore clicks if game over

    const row = parseInt(cardElement.dataset.row);
    const col = parseInt(cardElement.dataset.col);

    // --- Handle Marking/Blocking Modes First ---
    if (blockMode) {
        toggleCardState(blockedCards, row, col);
        renderBoard(); // Re-render to show/hide blocked state
        return; // Stop further processing
    }
    if (markMode) {
        toggleCardState(markedCards, row, col);
        renderBoard(); // Re-render to show/hide marked state
        return; // Stop further processing
    }

    // --- Normal Flip Logic ---

    // Ignore click if card is already blocked or flipped
    const isBlocked = blockedCards.some(c => c.row === row && c.col === col);
    const isFlipped = flippedCards.some(c => c.row === row && c.col === col);
    if (isBlocked || isFlipped) {
        return;
    }

    // --- Valid Flip Attempt ---
    currentFlips++; // <-- INCREMENT FLIP COUNTER HERE
    // **** DEBUG LOG 1 ****
    console.log(`Flip attempt valid. Current Flips now: ${currentFlips}`);

    // Add to revealed cards state
    flippedCards.push({ row, col });

    // --- Check Game Outcome ---
    const board = getBoard();
    const clickedPiece = board[row]?.[col]; // Get the piece from the board data

    // **** NEW DEBUG LOG ****
    console.log(`Checking click outcome: Row=${row}, Col=${col}, Clicked Piece='${clickedPiece}', Game Over=${gameOver}`);

    if (clickedPiece === 'K') {
        // Found the King - WIN!
        // **** DEBUG LOG 2 ****
        console.log("WIN CONDITION MET: King found!");
        gameOver = true;

        // --- Update Central Statistics ---
        const gridSize = getGridSize();
        const boardSizeValue = gridSize * gridSize; // Calculate total cards
        // **** DEBUG LOG 3 ****
        console.log(`PREPARING TO UPDATE STATS: GameID='chessSolitaire', Size=${boardSizeValue}, Flips=${currentFlips}`);
        // **** DEBUG LOG 4 **** (Error Check)
        if (typeof currentFlips !== 'number' || currentFlips < 1) {
             console.error("INVALID FLIP COUNT DETECTED:", currentFlips);
        } else {
             updateStat('chessSolitaire', boardSizeValue, currentFlips); // Call the NEW manager function
             // **** DEBUG LOG 5 ****
             console.log("updateStat function called.");
        }

        // Play sounds
        playCorrectSound();
        playWinSound();

        // Show win state visually immediately on the clicked card
        cardElement.classList.add('face-up', 'correct');
        cardElement.textContent = 'K';
        showMessage('You found the King!'); // <-- This should now work

        // Use setTimeout to allow visual feedback before overlay
        setTimeout(() => showGameOverScreen(true), 800); // Delay overlay slightly

    } else {
        // Clicked a non-King card
        playWrongSound();

        // Show wrong state visually immediately on the clicked card
        cardElement.classList.add('face-up', 'wrong');
        cardElement.textContent = clickedPiece === '-' ? '' : clickedPiece;
        showMessage("Keep looking!"); // <-- This should now work

        // Check if all non-king cards are flipped - LOSE!
        const nonKingCards = totalCards - 1;
        if (flippedCards.length >= nonKingCards) {
            gameOver = true;
            showMessage('Game Over! Try again.'); // <-- This should now work
            setTimeout(() => showGameOverScreen(false), 800); // Delay overlay
        } else {
            // Temporarily remove 'wrong' class after animation
             setTimeout(() => {
                cardElement.classList.remove('wrong');
                // Re-render might be needed here if other cards rely on this class
                // For now, direct removal is likely okay.
             }, 500); // Match shake animation duration
        }
    }
}

/**
 * Helper function to add/remove a card's position from a state array.
 * @param {Array} stateArray - The array to modify (markedCards or blockedCards).
 * @param {number} row - Row index.
 * @param {number} col - Column index.
 */
function toggleCardState(stateArray, row, col) {
    const cardIndex = stateArray.findIndex(c => c.row === row && c.col === col);
    if (cardIndex > -1) {
        // Card exists, remove it
        stateArray.splice(cardIndex, 1);
    } else {
        // Card doesn't exist, add it
        // If adding to blocked, remove from marked
        if (stateArray === blockedCards) {
             const markIndex = markedCards.findIndex(c => c.row === row && c.col === col);
             if (markIndex > -1) markedCards.splice(markIndex, 1);
        }
        // If adding to marked, remove from blocked
         if (stateArray === markedCards) {
             const blockIndex = blockedCards.findIndex(c => c.row === row && c.col === col);
             if (blockIndex > -1) blockedCards.splice(blockIndex, 1);
        }
        stateArray.push({ row, col });
    }
}

/** Creates and displays the game over modal. */
function showGameOverScreen(isWin) {
    // Prevent multiple overlays
    if (document.querySelector('.game-over-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';

    const content = document.createElement('div');
    content.className = 'game-over-content';
    content.textContent = isWin ? '👑 You found the King! 🎉' : '☠️ Game Over! Try again.';

    const button = document.createElement('button');
    button.textContent = 'Play Again';
    // Reload page for reset (simple approach)
    button.addEventListener('click', () => {
         window.location.reload();
    });

    content.appendChild(button);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
}

/** Optional: Update global hover styles if needed */
function updateHoverStyles() {
    // If hover styles depend on a class on the board itself, update here
    // Example: boardElement?.classList.toggle('mark-mode-active', markMode);
    // Example: boardElement?.classList.toggle('block-mode-active', blockMode);
    // Since styles use .card.mark-hover etc, rendering handles it.
}