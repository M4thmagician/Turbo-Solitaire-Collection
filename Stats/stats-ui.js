// js/stats-ui.js

const gameSelect = document.getElementById('game-select');
const sizeSelect = document.getElementById('size-select');
const statsDisplay = document.getElementById('stats-display');
const resetSelectedButton = document.getElementById('reset-selected-stats-button');

// Mapping game IDs to display names and value types
const gameDisplayInfo = {
    'jokerHunt': { name: 'Joker Hunt', valueLabel: 'Guesses' },
    'chessSolitaire': { name: 'Chess Solitaire', valueLabel: 'Flips' },
    'atomicPathfinder': { name: 'Atomic Pathfinder', valueLabel: 'Guesses' },
    'memorySolitaire': { name: 'Memory Solitaire', valueLabel: 'Mistakes' } // Future game
    // Add other games here
};

/**
 * Populates the game selection dropdown.
 * @param {Array<string>} gameIds - An array of game IDs that have stats.
 */
export function populateGameSelect(gameIds) {
    if (!gameSelect) return;
    // Clear existing options except the placeholder
    gameSelect.length = 1;

    gameIds.sort().forEach(id => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = gameDisplayInfo[id]?.name || id; // Use display name or ID
        gameSelect.appendChild(option);
    });
}

/**
 * Populates the board size selection dropdown for a specific game.
 * @param {Array<string|number>} sizes - An array of available sizes for the game.
 */
export function populateSizeSelect(sizes) {
    if (!sizeSelect) return;
    // Clear existing options except the placeholder
    sizeSelect.length = 1;

    if (sizes.length > 0) {
        sizeSelect.disabled = false;
        sizes.forEach(size => {
            const option = document.createElement('option');
            option.value = size;
            // Try to format size nicely (e.g., 9 -> 3x3)
            const dim = Math.sqrt(parseInt(size));
            if (dim % 1 === 0) { // It's a square
                 option.textContent = `${dim}x${dim} (${size})`;
            } else {
                 option.textContent = size; // Default display
            }
            sizeSelect.appendChild(option);
        });
    } else {
        sizeSelect.disabled = true;
    }
}

/**
 * Displays the fetched statistics in the designated area.
 * @param {object|null} statsData - The stats object { gamesPlayed, totalValue, averageValue } or null.
 * @param {string} gameId - The ID of the game to customize labels.
 */
export function displayStats(statsData, gameId) {
    if (!statsDisplay) return;

    if (!statsData || statsData.gamesPlayed === 0) {
        statsDisplay.innerHTML = `<p>No statistics recorded for this selection yet.</p>`;
        if (resetSelectedButton) resetSelectedButton.disabled = true;
        return;
    }

    const valueLabel = gameDisplayInfo[gameId]?.valueLabel || 'Value'; // Get label (Guesses, Flips, etc.)

    statsDisplay.innerHTML = `
        <p><strong>Games Played:</strong> ${statsData.gamesPlayed}</p>
        <p><strong>Total ${valueLabel}:</strong> ${statsData.totalValue}</p>
        <p><strong>Average ${valueLabel}:</strong> ${statsData.averageValue}</p>
    `;
    if (resetSelectedButton) resetSelectedButton.disabled = false; // Enable reset for selection
}

/** Clears the stats display area and disables size select/reset button. */
export function clearStatsDisplay() {
     if (!statsDisplay) return;
     statsDisplay.innerHTML = `<p>Please select a game and board size to view stats.</p>`;
     if (sizeSelect) {
        sizeSelect.length = 1; // Clear options
        sizeSelect.disabled = true;
     }
     if (resetSelectedButton) resetSelectedButton.disabled = true;
}