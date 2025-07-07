// js/stats-app.js
import * as statsManager from './stats-manager.js';
import * as statsUi from './stats-ui.js';

const gameSelect = document.getElementById('game-select');
const sizeSelect = document.getElementById('size-select');
const resetSelectedButton = document.getElementById('reset-selected-stats-button');
const resetAllButton = document.getElementById('reset-all-stats-button');

/** Initializes the statistics page. */
function initializeStatsPage() {
    console.log("Initializing Stats Page...");

    // Populate game select on load
    const availableGames = statsManager.getAvailableGames();
    statsUi.populateGameSelect(availableGames);
    statsUi.clearStatsDisplay(); // Ensure clear state initially

    // Add event listeners
    setupEventListeners();

    console.log("Stats Page Initialized.");
}

/** Sets up event listeners for controls. */
function setupEventListeners() {
    if (gameSelect) {
        gameSelect.addEventListener('change', handleGameSelectionChange);
    }
    if (sizeSelect) {
        sizeSelect.addEventListener('change', handleSizeSelectionChange);
    }
    if (resetSelectedButton) {
        resetSelectedButton.addEventListener('click', handleResetSelected);
    }
    if (resetAllButton) {
        resetAllButton.addEventListener('click', handleResetAll);
    }
}

/** Handles changes in the game selection dropdown. */
function handleGameSelectionChange() {
    const selectedGameId = gameSelect.value;
    statsUi.clearStatsDisplay(); // Clear display when game changes

    if (selectedGameId) {
        const availableSizes = statsManager.getAvailableSizesForGame(selectedGameId);
        statsUi.populateSizeSelect(availableSizes);
    } else {
        statsUi.populateSizeSelect([]); // Clear size dropdown if no game selected
    }
}

/** Handles changes in the board size selection dropdown. */
function handleSizeSelectionChange() {
    const selectedGameId = gameSelect.value;
    const selectedSize = sizeSelect.value;

    if (selectedGameId && selectedSize) {
        const statsData = statsManager.getStatsFor(selectedGameId, selectedSize);
        statsUi.displayStats(statsData, selectedGameId); // Pass gameId for label context
    } else {
        statsUi.clearStatsDisplay(); // Clear if selection is incomplete
    }
}

/** Handles clicking the 'Reset Selected Stats' button. */
function handleResetSelected() {
    const selectedGameId = gameSelect.value;
    const selectedSize = sizeSelect.value;

    if (!selectedGameId || !selectedSize) {
        alert("Please select a game and board size to reset.");
        return;
    }

    const gameName = gameSelect.options[gameSelect.selectedIndex].text;
    const sizeName = sizeSelect.options[sizeSelect.selectedIndex].text;

    if (confirm(`Are you sure you want to reset stats for ${gameName} (${sizeName})?`)) {
        const success = statsManager.resetStats(selectedGameId, selectedSize);
        if (success) {
            alert("Selected stats reset successfully.");
            // Refresh display
            const statsData = statsManager.getStatsFor(selectedGameId, selectedSize);
            statsUi.displayStats(statsData, selectedGameId);
            // Check if sizes need updating (if last size for game was removed)
            const availableSizes = statsManager.getAvailableSizesForGame(selectedGameId);
             if(availableSizes.length === 0 && selectedGameId) {
                // If no more sizes, potentially refresh game list or reset UI further
                statsUi.populateSizeSelect([]);
                statsUi.clearStatsDisplay();
                // Maybe even remove the game from the game select if desired
             } else {
                // Refresh size select in case the deleted size was the only one
                 statsUi.populateSizeSelect(availableSizes);
                // Need to re-select if possible or clear display
                handleSizeSelectionChange(); // Re-trigger display logic
             }

        } else {
            alert("Could not reset selected stats (they might not exist).");
        }
    }
}

/** Handles clicking the 'Reset ALL Stats' button. */
function handleResetAll() {
     if (confirm("Are you sure you want to reset ALL statistics for ALL games? This cannot be undone.")) {
         const success = statsManager.resetAllStats();
         if (success) {
             alert("All statistics have been reset.");
             // Refresh the entire UI
             statsUi.populateGameSelect([]); // Clear game select
             statsUi.clearStatsDisplay(); // Clear display and size select
         } else {
             alert("An error occurred while resetting all stats.");
         }
     }
}


// --- Start Application ---
document.addEventListener('DOMContentLoaded', initializeStatsPage);