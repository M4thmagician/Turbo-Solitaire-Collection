// js/stats-manager.js

const STORAGE_KEY = 'solitaireCollectionStats';

/**
 * Loads stats data from localStorage.
 * @returns {object} The parsed stats object or an empty object if none exists/error.
 */
export function loadStats() {
    try {
        const statsJson = localStorage.getItem(STORAGE_KEY);
        return statsJson ? JSON.parse(statsJson) : {};
    } catch (error) {
        console.error("Error loading stats from localStorage:", error);
        return {}; // Return empty object on error
    }
}

/**
 * Saves the provided stats data to localStorage.
 * @param {object} statsData - The stats object to save.
 */
function saveStats(statsData) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(statsData));
    } catch (error) {
        console.error("Error saving stats to localStorage:", error);
    }
}

/**
 * Updates the statistics for a specific game and board size.
 * @param {string} gameId - Identifier for the game (e.g., 'jokerHunt', 'chessSolitaire').
 * @param {number|string} boardSize - The size identifier (e.g., 9, 16, '4x4'). Use consistent type (number recommended).
 * @param {number} value - The value to record for this game session (e.g., guesses, flips, mistakes).
 */
export function updateStat(gameId, boardSize, value) {
    if (value === undefined || value === null || isNaN(value) || value < 0) {
        console.warn(`Invalid stat value provided for ${gameId} (${boardSize}): ${value}`);
        return;
    }

    const stats = loadStats();

    // Ensure game entry exists
    if (!stats[gameId]) {
        stats[gameId] = {};
    }

    // Ensure board size entry exists with defaults
    if (!stats[gameId][boardSize]) {
        stats[gameId][boardSize] = { gamesPlayed: 0, totalValue: 0, averageValue: '0.00' };
    }

    const currentStat = stats[gameId][boardSize];

    // Update stats
    currentStat.gamesPlayed++;
    currentStat.totalValue += value;
    currentStat.averageValue = (currentStat.totalValue / currentStat.gamesPlayed).toFixed(2);

    // Save updated stats
    saveStats(stats);
    console.log(`Stat updated: ${gameId}, Size: ${boardSize}, Value: ${value}, New Avg: ${currentStat.averageValue}`);
}

/**
 * Retrieves statistics for a specific game and board size.
 * @param {string} gameId - Identifier for the game.
 * @param {number|string} boardSize - The size identifier.
 * @returns {object} The stats object { gamesPlayed, totalValue, averageValue } or default values.
 */
export function getStatsFor(gameId, boardSize) {
    const stats = loadStats();
    const defaultStats = { gamesPlayed: 0, totalValue: 0, averageValue: '0.00' };

    return stats[gameId]?.[boardSize] ?? defaultStats;
}

/**
 * Resets statistics for a specific game and board size.
 * @param {string} gameId - Identifier for the game.
 * @param {number|string} boardSize - The size identifier.
 * @returns {boolean} True if stats were reset, false otherwise.
 */
export function resetStats(gameId, boardSize) {
    const stats = loadStats();
    let reset = false;

    if (stats[gameId] && stats[gameId][boardSize]) {
        delete stats[gameId][boardSize];
        // Optional: delete gameId if it becomes empty
        if (Object.keys(stats[gameId]).length === 0) {
            delete stats[gameId];
        }
        saveStats(stats);
        reset = true;
    }
    console.log(`Stats reset attempted for ${gameId} (${boardSize}): ${reset}`);
    return reset;
}

/** Resets ALL statistics for all games and sizes. */
export function resetAllStats() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log("All stats reset.");
        return true;
    } catch (error) {
        console.error("Error resetting all stats:", error);
        return false;
    }
}

/** Gets the names/IDs of all games that have stats stored. */
export function getAvailableGames() {
    const stats = loadStats();
    return Object.keys(stats);
}

/** Gets the available board sizes for a specific game. */
export function getAvailableSizesForGame(gameId) {
     const stats = loadStats();
     return stats[gameId] ? Object.keys(stats[gameId]).sort((a, b) => +a - +b) : []; // Sort sizes numerically
}