// --- Game Configuration ---
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suits = {
    spades:   { symbol: '♠', colorClass: 'suit-black' },
    hearts:   { symbol: '♥', colorClass: 'suit-red' },
    diamonds: { symbol: '♦', colorClass: 'suit-red' },
    clubs:    { symbol: '♣', colorClass: 'suit-black' }
};
const suitKeys = Object.keys(suits);

// --- DOM Elements ---
const gameBoard = document.getElementById('game-board');
const messageArea = document.getElementById('message-area');
const newGameButton = document.getElementById('new-game-button');
const suitSelector = document.getElementById('suit-selector');

// --- Game State Variables ---
let deck = [];
let currentExpectedRankIndex = 0;
let targetSuit = null; // The suit of the current sequence attempt
let correctCardsElements = [];
let lockBoard = true;
let wronglyClickedCardElement = null;

// --- Utility Functions ---

/**
 * Updates the data-locked attribute on the game board for CSS styling.
 * @param {boolean} isLocked - Whether the board should be marked as locked.
 */
function updateBoardLockStatus(isLocked) {
     lockBoard = isLocked;
     gameBoard.dataset.locked = isLocked ? 'true' : 'false';
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {Array} array - The array to shuffle.
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Creates the HTML element for a single card.
 * @param {object} cardData - An object with rank and suit properties.
 * @returns {HTMLElement} The card's div element.
 */
function createCardElement({ rank, suit }) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.rank = rank;
    card.dataset.suit = suit;
    card.innerHTML = `<span class="card-back-symbol">?</span>`;
    card.addEventListener('click', handleCardClick);
    return card;
}

/**
 * Updates the card's appearance to show its rank and suit.
 * @param {HTMLElement} cardElement - The card element to reveal.
 */
function revealCard(cardElement) {
    const rank = cardElement.dataset.rank;
    const suitKey = cardElement.dataset.suit;
    const suitInfo = suits[suitKey];

    cardElement.innerHTML = '';
    cardElement.classList.add('revealed', suitInfo.colorClass);

    const rankSpan = document.createElement('span');
    rankSpan.textContent = rank;
    cardElement.appendChild(rankSpan);

    const suitTop = document.createElement('span');
    suitTop.classList.add('suit', 'suit-top-left');
    suitTop.textContent = suitInfo.symbol;
    cardElement.appendChild(suitTop);

    const suitBottom = document.createElement('span');
    suitBottom.classList.add('suit', 'suit-bottom-right');
    suitBottom.textContent = suitInfo.symbol;
    cardElement.appendChild(suitBottom);
}

/**
 * Updates the card's appearance to hide its rank and suit (show back).
 * @param {HTMLElement} cardElement - The card element to hide.
 */
function hideCard(cardElement) {
    if (cardElement && cardElement.classList.contains('revealed')) {
        const suitKey = cardElement.dataset.suit;
        cardElement.classList.remove('revealed', 'correct', suits[suitKey].colorClass);
        cardElement.innerHTML = `<span class="card-back-symbol">?</span>`;
    }
}

/**
 * Resets the current sequence attempt (flips cards down, resets index).
 */
function resetAttempt() {
    correctCardsElements.forEach(hideCard);
    if (wronglyClickedCardElement) {
        hideCard(wronglyClickedCardElement);
    }
    currentExpectedRankIndex = 0;
    targetSuit = null;
    correctCardsElements = [];
    wronglyClickedCardElement = null;
    messageArea.textContent = 'Find any Ace!';
    updateBoardLockStatus(false);
}

/**
 * Handles the logic when a card is clicked.
 */
function handleCardClick() {
    // If the board is locked, check for a reset condition (clicking any face-down card or a revealed Ace)
    if (lockBoard) {
        const isFaceDown = !this.classList.contains('revealed');
        const isRevealedAce = this.classList.contains('revealed') && this.dataset.rank === 'A';
        if (isFaceDown || isRevealedAce) {
            resetAttempt();
            handleCardClick.call(this); // Process the click again now that the board is unlocked
            return;
        }
    }

    // Ignore clicks if board is locked or card is already revealed
    if (lockBoard || this.classList.contains('revealed')) {
        return;
    }

    const clickedCardElement = this;
    const clickedRank = clickedCardElement.dataset.rank;
    const clickedSuit = clickedCardElement.dataset.suit;
    
    revealCard(clickedCardElement);

    let isCorrect = false;
    // First card in a sequence must be an Ace
    if (currentExpectedRankIndex === 0) {
        if (clickedRank === 'A') {
            isCorrect = true;
            targetSuit = clickedSuit; // Set the target suit for the rest of the sequence
        }
    } else {
        // Subsequent cards must match the expected rank and the established target suit
        const expectedRank = ranks[currentExpectedRankIndex];
        if (clickedRank === expectedRank && clickedSuit === targetSuit) {
            isCorrect = true;
        }
    }
    
    if (isCorrect) {
        clickedCardElement.classList.add('correct');
        correctCardsElements.push(clickedCardElement);
        currentExpectedRankIndex++;

        // Check for win condition
        if (currentExpectedRankIndex === ranks.length) {
            messageArea.innerHTML = `You Win! Click a card to play again.`;
            updateBoardLockStatus(true);
        } else {
            // Update message for the next card in the sequence
            const nextRank = ranks[currentExpectedRankIndex];
            const suitSymbol = suits[targetSuit].symbol;
            messageArea.innerHTML = `Correct! Now find the ${nextRank} of <span class="${suits[targetSuit].colorClass}">${suitSymbol}</span>.`;
        }
    } else {
        // Incorrect card was clicked
        const suitSymbol = suits[clickedSuit].symbol;
        messageArea.innerHTML = `Wrong! That was ${clickedRank} of <span class="${suits[clickedSuit].colorClass}">${suitSymbol}</span>. Try again.`;
        wronglyClickedCardElement = clickedCardElement;
        updateBoardLockStatus(true); // Lock the board until the user resets
    }
}

/**
 * Initializes or resets the game board for a COMPLETELY NEW game.
 */
function setupNewGame() {
    const numSuits = parseInt(suitSelector.value, 10);
    
    // 1. Reset state and clear board
    updateBoardLockStatus(true); // Lock during setup
    currentExpectedRankIndex = 0;
    targetSuit = null;
    correctCardsElements = [];
    wronglyClickedCardElement = null;
    gameBoard.innerHTML = '';
    deck = [];

    // 2. Create the deck based on selection
    for (let i = 0; i < numSuits; i++) {
        const suitKey = suitKeys[i];
        ranks.forEach(rank => {
            deck.push({ rank, suit: suitKey });
        });
    }
    shuffle(deck);

    // 3. Adjust grid layout for the number of cards
    const cardCount = deck.length;
    if (cardCount <= 13) {
        gameBoard.className = 'grid grid-cols-4 sm:grid-cols-7 gap-3 justify-center mb-6';
    } else if (cardCount <= 26) {
        gameBoard.className = 'grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-3 justify-center mb-6';
    } else if (cardCount <= 39) {
        gameBoard.className = 'grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-13 gap-3 justify-center mb-6';
    } else { // 52 cards
        gameBoard.className = 'grid grid-cols-7 sm:grid-cols-9 md:grid-cols-13 gap-3 justify-center mb-6';
    }
    
    // 4. Create and append card elements
    deck.forEach(cardData => {
        const cardElement = createCardElement(cardData);
        gameBoard.appendChild(cardElement);
    });
    
    // 5. Finalize setup
    messageArea.textContent = 'Find any Ace!';
    updateBoardLockStatus(false); // Unlock to start play
}

// --- Event Listeners ---
newGameButton.addEventListener('click', setupNewGame);
if (suitSelector) {
    suitSelector.addEventListener('change', setupNewGame);
}


// --- Initial Game Setup ---
window.onload = () => {
    // Check if the suit selector exists before trying to set up the game
    if (suitSelector) {
        // Initial message to prompt user action
        messageArea.textContent = 'Select suits and press "New Game"!';
        gameBoard.dataset.locked = 'true';
    } else {
        // Fallback for the single-suit version if selector is missing
        console.warn("Suit selector not found. Falling back to single suit game logic if it were defined.");
        messageArea.textContent = 'Error: Suit selector not found in HTML.';
