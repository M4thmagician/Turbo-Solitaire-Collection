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

        function createCardElement({ rank, suit }) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.rank = rank;
            card.dataset.suit = suit;
            card.innerHTML = `<span class="card-back-symbol">?</span>`;
            card.addEventListener('click', handleCardClick);
            return card;
        }

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

        function hideCard(cardElement) {
            if (cardElement && cardElement.classList.contains('revealed')) {
                const suitKey = cardElement.dataset.suit;
                cardElement.classList.remove('revealed', 'correct', suits[suitKey].colorClass);
                cardElement.innerHTML = `<span class="card-back-symbol">?</span>`;
            }
        }

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

            if (lockBoard || this.classList.contains('revealed')) {
                return;
            }

            const clickedCardElement = this;
            const clickedRank = clickedCardElement.dataset.rank;
            const clickedSuit = clickedCardElement.dataset.suit;
            
            revealCard(clickedCardElement);

            let isCorrect = false;
            // First card must be an Ace
            if (currentExpectedRankIndex === 0) {
                if (clickedRank === 'A') {
                    isCorrect = true;
                    targetSuit = clickedSuit; // Set the target suit for the sequence
                }
            } else {
                // Subsequent cards must match rank and the target suit
                const expectedRank = ranks[currentExpectedRankIndex];
                if (clickedRank === expectedRank && clickedSuit === targetSuit) {
                    isCorrect = true;
                }
            }
            
            if (isCorrect) {
                clickedCardElement.classList.add('correct');
                correctCardsElements.push(clickedCardElement);
                currentExpectedRankIndex++;

                if (currentExpectedRankIndex === ranks.length) {
                    messageArea.innerHTML = `You Win! Click a card to play again.`;
                    updateBoardLockStatus(true);
                } else {
                    const nextRank = ranks[currentExpectedRankIndex];
                    const suitSymbol = suits[targetSuit].symbol;
                    messageArea.innerHTML = `Correct! Now find the ${nextRank} of <span class="${suits[targetSuit].colorClass}">${suitSymbol}</span>.`;
                }
            } else {
                const suitSymbol = suits[clickedSuit].symbol;
                messageArea.innerHTML = `Wrong! That was ${clickedRank} of <span class="${suits[clickedSuit].colorClass}">${suitSymbol}</span>. Try again.`;
                wronglyClickedCardElement = clickedCardElement;
                updateBoardLockStatus(true);
            }
        }

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
        suitSelector.addEventListener('change', setupNewGame);

        // --- Initial Game Setup ---
        window.onload = () => {
            // Don't start a game automatically, let the user choose.
            // setupNewGame(); // Removed to allow user to press button first
        };
