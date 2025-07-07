// js/deck.js

// Exported variables holding deck state
export let cards = [];
export let gridSize = 3; // Default size
export let jokerIndex = -1; // Default index

/**
 * Creates and shuffles the deck of cards.
 * @param {number} numCards - The total number of cards (must be a perfect square).
 */
export function createCards(numCards) {
    const numberOfCards = +numCards; // Ensure it's a number

    // Validate input
    if (isNaN(numberOfCards) || numberOfCards <= 0 || Math.sqrt(numberOfCards) % 1 !== 0) {
        console.error("Invalid number of cards:", numCards, "- must be a positive perfect square.");
        // Default to 3x3 (9 cards) as a fallback
        gridSize = 3;
        cards = Array(8).fill('1').concat('Joker');
    } else {
        gridSize = Math.sqrt(numberOfCards);
        // Create array with (numCards - 1) '1's and one 'Joker'
        cards = Array(numberOfCards - 1).fill('1').concat('Joker');
    }

    // Fisher–Yates shuffle algorithm
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    // Find the index of the Joker after shuffling
    jokerIndex = cards.indexOf('Joker');

    // console.log(`Deck created: ${gridSize}x${gridSize}, Joker at index ${jokerIndex}`); // For debugging
}