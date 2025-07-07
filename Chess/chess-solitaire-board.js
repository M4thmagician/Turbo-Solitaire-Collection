// js/chess-solitaire-board.js

// --- Game Constants ---
// REMOVED: export const PIECE_TYPES - No longer needed for placement logic
const KING = 'K';
const EMPTY = '-'; // Represents an empty square initially

// --- Game State (Module Scope) ---
let board = []; // 2D array representing the board pieces ('K', 'B', 'R', 'N', 'P', '-')
let kingPosition = null; // { row: number, col: number }
// REMOVED: let attackingPieceType - No longer determines placement
let gridSize = 4; // Default grid size (4x4)

// --- Exported Functions ---

/**
 * Sets the grid size for the board.
 * @param {number} size - The new grid dimension (e.g., 4 for a 4x4 board).
 */
export function setGridSize(size) {
    gridSize = size;
}

/**
 * Creates a new empty board array, places the King randomly,
 * and then places ALL potential attacking pieces.
 */
export function createBoard() {
    board = [];
    for (let i = 0; i < gridSize; i++) {
        board[i] = [];
        for (let j = 0; j < gridSize; j++) {
            board[i][j] = EMPTY;
        }
    }

    // Randomly place the king
    const kingRow = Math.floor(Math.random() * gridSize);
    const kingCol = Math.floor(Math.random() * gridSize);
    kingPosition = { row: kingRow, col: kingCol };
    board[kingRow][kingCol] = KING;

    // REMOVED: Determination of single attackingPieceType

    // Place ALL attacking pieces based on king position using the old logic
    placeAttackingPieces(kingRow, kingCol); // Pass only king position

    // **** Optional Debug Log ****
    console.log("[Board Module - Old Logic] Board created:", JSON.stringify(board));
    console.log("[Board Module - Old Logic] King Position:", kingPosition);
}

/**
 * Places ALL potential attacking pieces (Pawns, Rooks, Bishops, Knights)
 * on the board relative to the King's position.
 * This function now replicates the logic from your original single file.
 * @param {number} n - The King's row index.
 * @param {number} m - The King's column index.
 */
function placeAttackingPieces(n, m) { // Renamed parameters back for consistency with old code
    // No need to clear here as createBoard initializes with EMPTY

// Pawns: Place pawns attacking from below (row n+1)
if (n + 1 < gridSize) { // Check if the row BELOW the king is valid
    if (m - 1 >= 0 && board[n + 1][m - 1] === EMPTY) board[n + 1][m - 1] = 'P';       // Place pawn down-left
    if (m + 1 < gridSize && board[n + 1][m + 1] === EMPTY) board[n + 1][m + 1] = 'P'; // Place pawn down-right
}

    // Rooks: row n, column m
    if (n >= 0 && n < gridSize) {
        for (let c = 0; c < gridSize; c++) {
            if (c !== m && board[n][c] === EMPTY) { // Check if empty before placing
                board[n][c] = 'R';
            }
        }
    }
    if (m >= 0 && m < gridSize) {
        for (let r = 0; r < gridSize; r++) {
            if (r !== n && board[r][m] === EMPTY) { // Check if empty
                board[r][m] = 'R';
            }
        }
    }

    // Bishops: diagonals from (n, m)
    for (let k = 1; k < gridSize; k++) {
        // Check top-left diagonal
        if (n - k >= 0 && m - k >= 0 && board[n - k][m - k] === EMPTY) board[n - k][m - k] = 'B';
        // Check top-right diagonal
        if (n - k >= 0 && m + k < gridSize && board[n - k][m + k] === EMPTY) board[n - k][m + k] = 'B';
        // Check bottom-left diagonal
        if (n + k < gridSize && m - k >= 0 && board[n + k][m - k] === EMPTY) board[n + k][m - k] = 'B';
        // Check bottom-right diagonal
        if (n + k < gridSize && m + k < gridSize && board[n + k][m + k] === EMPTY) board[n + k][m + k] = 'B';
    }

    // Knights: standard L-shaped moves
    const knightMoves = [
        [-1, -2], [-1, 2], [1, -2], [1, 2],
        [-2, -1], [-2, 1], [2, -1], [2, 1]
    ];
    for (const [rowOffset, colOffset] of knightMoves) {
        const newRow = n + rowOffset;
        const newCol = m + colOffset;
        // Check bounds and if square is empty
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize && board[newRow][newCol] === EMPTY) {
            board[newRow][newCol] = 'N';
        }
    }
    // IMPORTANT: King remains 'K' even if a piece could theoretically land there
    board[n][m] = KING;
}

// REMOVED: function canAttack(...) - No longer needed for this logic

// --- Getters for state (provide controlled access) ---

export function getBoard() {
    return board;
}

export function getKingPosition() {
    return kingPosition;
}

export function getGridSize() {
    return gridSize;
}