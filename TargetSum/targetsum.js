// --- Game State Variables ---
let board = [];
let targetSum = 0;
let currentSum = 0;
let score = 0;
let selectedCards = [];
let boardSize = 4;
const MIN_CARDS_FOR_TARGET = 2;
const MAX_CARDS_FOR_TARGET = 3;

// --- DOM Elements ---
const gameBoardElement = document.getElementById('gameBoard');
const targetSumDisplay = document.getElementById('targetSumDisplay');
const currentSumDisplay = document.getElementById('currentSumDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const newGameButton = document.getElementById('newGameButton');
const feedbackMessage = document.getElementById('feedbackMessage');
const boardSizeSelect = document.getElementById('boardSizeSelect');
const modal = document.getElementById('customModal');
const modalMessage = document.getElementById('modalMessage');
const modalCloseButton = document.getElementById('modalCloseButton');

modalCloseButton.onclick = function() {
    modal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
function showModal(message) {
    modalMessage.textContent = message;
    modal.style.display = "flex";
}
// --- Game Logic Functions ---
function initGame() {
    board = [];
    selectedCards = [];
    currentSum = 0;
    score = 0;
    boardSize = parseInt(boardSizeSelect.value);
    gameBoardElement.innerHTML = '';
    gameBoardElement.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    const cardWidth = boardSize === 5 ? 60 : 70;
    const cardHeight = boardSize === 5 ? 85 : 100;
    for (let i = 0; i < boardSize * boardSize; i++) {
        const cardValue = Math.floor(Math.random() * 9) + 1;
        const cardElement = document.createElement('div');
        cardElement.classList.add('card', 'card-face-down');
        cardElement.dataset.id = i;
        cardElement.style.width = `${cardWidth}px`;
        cardElement.style.height = `${cardHeight}px`;
        cardElement.style.fontSize = boardSize === 5 ? '20px' : '24px';
        const cardData = {
            id: i,
            value: cardValue,
            isRevealed: false,
            isSelected: false,
            isUsed: false,
            element: cardElement
        };
        board.push(cardData);
        gameBoardElement.appendChild(cardElement);
        cardElement.addEventListener('click', () => handleCardClick(cardData));
        cardElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleCardClick(cardData);
        }, { passive: false });
    }
    if (!generateNewTargetSum()) {
        showModal("Game Over! No more possible sums. Start a new game.");
        disableAllCards();
    }
    updateDisplay();
    feedbackMessage.textContent = "Click cards to reveal numbers!";
}
function handleCardClick(cardData) {
    if (cardData.isUsed) {
        feedbackMessage.textContent = "This card has already been used.";
        return;
    }
    if (!cardData.isRevealed) {
        cardData.isRevealed = true;
        cardData.element.classList.remove('card-face-down');
        cardData.element.classList.add('card-face-up');
        cardData.element.textContent = cardData.value;
        feedbackMessage.textContent = `Revealed ${cardData.value}. Select cards to match target.`;
        return;
    }
    if (cardData.isRevealed && !cardData.isUsed) {
        cardData.isSelected = !cardData.isSelected;
        if (cardData.isSelected) {
            cardData.element.classList.add('card-selected');
            selectedCards.push(cardData);
        } else {
            cardData.element.classList.remove('card-selected');
            selectedCards = selectedCards.filter(c => c.id !== cardData.id);
        }
        updateCurrentSum();
        checkSum();
    }
    updateDisplay();
}
function updateCurrentSum() {
    currentSum = selectedCards.reduce((sum, card) => sum + card.value, 0);
}
function checkSum() {
    if (currentSum === targetSum && targetSum > 0 && selectedCards.length > 0) {
        score++;
        feedbackMessage.textContent = `Correct! ${targetSum} found.`;
        selectedCards.forEach(card => {
            card.isUsed = true;
            card.isSelected = false;
            card.element.classList.remove('card-selected', 'card-face-up');
            card.element.classList.add('card-used');
        });
        selectedCards = [];
        currentSum = 0;
        if (!generateNewTargetSum()) {
            showModal("Congratulations! No more possible sums with remaining cards. Game Over!");
            disableAllCards();
        }
    } else if (currentSum > targetSum && targetSum > 0) {
        feedbackMessage.textContent = "Sum is too high! Deselect cards or try a different combination.";
    } else if (selectedCards.length > 0) {
        feedbackMessage.textContent = "Keep selecting cards...";
    }
}
function generateNewTargetSum() {
    const availableCards = board.filter(card => !card.isUsed);
    if (availableCards.length < MIN_CARDS_FOR_TARGET) {
        targetSum = 0;
        return false;
    }
    let attempts = 0;
    const maxAttempts = 50;
    while(attempts < maxAttempts) {
        let tempTargetCards = [];
        let tempTargetSum = 0;
        const shuffledAvailableCards = [...availableCards].sort(() => 0.5 - Math.random());
        let numToPick = Math.random() < 0.6 ? MIN_CARDS_FOR_TARGET : MAX_CARDS_FOR_TARGET;
        if (shuffledAvailableCards.length < numToPick) {
            numToPick = shuffledAvailableCards.length;
        }
        if (numToPick < MIN_CARDS_FOR_TARGET) {
             targetSum = 0;
             return false;
        }
        for (let i = 0; i < numToPick; i++) {
            tempTargetCards.push(shuffledAvailableCards[i]);
            tempTargetSum += shuffledAvailableCards[i].value;
        }
        if (tempTargetSum > 0 && tempTargetSum !== targetSum) {
            targetSum = tempTargetSum;
            return true;
        }
        attempts++;
    }
    if (availableCards.length >= MIN_CARDS_FOR_TARGET) {
         let numToPick = Math.min(MAX_CARDS_FOR_TARGET, availableCards.length);
         numToPick = Math.max(MIN_CARDS_FOR_TARGET, numToPick);
         const shuffledAvailableCards = [...availableCards].sort(() => 0.5 - Math.random());
         targetSum = 0;
         for(let i=0; i<numToPick; i++){
            targetSum += shuffledAvailableCards[i].value;
         }
         if(targetSum > 0) return true;
    }
    targetSum = 0;
    return false;
}
function disableAllCards() {
    board.forEach(card => {
        if (!card.isUsed) {
            card.isUsed = true;
            if (!card.isRevealed) {
                 card.element.classList.remove('card-face-down');
                 card.element.classList.add('card-used');
                 card.element.textContent = card.value;
            } else if (!card.isSelected) {
                 card.element.classList.remove('card-face-up');
                 card.element.classList.add('card-used');
            }
        }
        card.element.style.cursor = 'not-allowed';
    });
}
function updateDisplay() {
    targetSumDisplay.textContent = targetSum > 0 ? targetSum : '-';
    currentSumDisplay.textContent = currentSum;
    scoreDisplay.textContent = score;
}
newGameButton.addEventListener('click', initGame);
boardSizeSelect.addEventListener('change', initGame);
window.onload = () => {
    initGame();
};
