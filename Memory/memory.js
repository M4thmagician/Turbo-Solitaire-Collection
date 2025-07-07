// --- Game Configuration ---
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suitSymbol = '♠'; // Using Spades for this example

// --- DOM Elements ---
const gameBoard = document.getElementById('game-board');
const messageArea = document.getElementById('message-area');
const newGameButton = document.getElementById('new-game-button');

// --- Game State Variables ---
let currentCards = []; // Holds the current arrangement of cards (ranks) - persistent until New Game
let cardElements = []; // Holds the DOM elements for the cards - persistent until New Game
let currentExpectedRankIndex = 0; // Index in 'ranks' array for the next card - resets on mistake/win reset
let correctCardsElements = []; // Store DOM elements of cards revealed correctly in the current sequence attempt - resets on mistake/win reset
let lockBoard = false; // Prevents clicking during animations/resets or after game ends
let wronglyClickedCardElement = null; // Store the element that was clicked incorrectly

// --- Utility Functions ---
function updateBoardLockStatus(isLocked) {
    lockBoard = isLocked;
    gameBoard.dataset.locked = isLocked ? 'true' : 'false';
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createCardElement(rank) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.rank = rank;
    const cardBackSymbol = document.createElement('span');
    cardBackSymbol.classList.add('card-back-symbol');
    cardBackSymbol.textContent = '?';
    card.appendChild(cardBackSymbol);
    card.addEventListener('click', handleCardClick);
    return card;
}

function revealCard(cardElement) {
    const rank = cardElement.dataset.rank;
    cardElement.innerHTML = '';
    cardElement.classList.add('revealed');
    const rankSpan = document.createElement('span');
    rankSpan.textContent = rank;
    cardElement.appendChild(rankSpan);
    const suitTop = document.createElement('span');
    suitTop.classList.add('suit', 'suit-top-left');
    suitTop.textContent = suitSymbol;
    cardElement.appendChild(suitTop);
    const suitBottom = document.createElement('span');
    suitBottom.classList.add('suit', 'suit-bottom-right');
    suitBottom.textContent = suitSymbol;
    cardElement.appendChild(suitBottom);
}

function hideCard(cardElement) {
    if (cardElement && cardElement.classList.contains('revealed')) {
        cardElement.classList.remove('revealed', 'correct');
        cardElement.innerHTML = '';
        const cardBackSymbol = document.createElement('span');
        cardBackSymbol.classList.add('card-back-symbol');
        cardBackSymbol.textContent = '?';
        cardElement.appendChild(cardBackSymbol);
    }
}

function resetAttempt() {
    correctCardsElements.forEach(card => {
        hideCard(card);
    });
    if (wronglyClickedCardElement) {
        hideCard(wronglyClickedCardElement);
    }
    currentExpectedRankIndex = 0;
    correctCardsElements = [];
    wronglyClickedCardElement = null;
    messageArea.textContent = 'Find the Ace!';
    updateBoardLockStatus(false);
}

function handleCardClick() {
    if (lockBoard) {
        const isFaceDown = !this.classList.contains('revealed');
        const isRevealedAce = this.classList.contains('revealed') && this.dataset.rank === 'A';
        if (isFaceDown || isRevealedAce) {
            resetAttempt();
            handleCardClick.call(this);
            return;
        }
    }
    if (lockBoard) {
        return;
    }
    if (this.classList.contains('revealed')) {
        return;
    }
    const clickedCardElement = this;
    const clickedRank = clickedCardElement.dataset.rank;
    const expectedRank = ranks[currentExpectedRankIndex];
    revealCard(clickedCardElement);
    if (clickedRank === expectedRank) {
        clickedCardElement.classList.add('correct');
        correctCardsElements.push(clickedCardElement);
        currentExpectedRankIndex++;
        if (currentExpectedRankIndex === ranks.length) {
            messageArea.textContent = 'You Win! Click Ace or face-down card to play again.';
            updateBoardLockStatus(true);
        } else {
            messageArea.textContent = `Correct! Now find the ${ranks[currentExpectedRankIndex]}.`;
        }
    } else {
        messageArea.textContent = `Wrong! Click face-down card to try again.`;
        wronglyClickedCardElement = clickedCardElement;
        updateBoardLockStatus(true);
    }
}

function setupNewGame() {
    currentExpectedRankIndex = 0;
    correctCardsElements = [];
    cardElements = [];
    wronglyClickedCardElement = null;
    updateBoardLockStatus(false);
    messageArea.textContent = 'Find the Ace!';
    gameBoard.innerHTML = '';
    currentCards = [...ranks];
    shuffle(currentCards);
    currentCards.forEach(rank => {
        const cardElement = createCardElement(rank);
        gameBoard.appendChild(cardElement);
        cardElements.push(cardElement);
    });
}

newGameButton.addEventListener('click', setupNewGame);
window.onload = setupNewGame;
