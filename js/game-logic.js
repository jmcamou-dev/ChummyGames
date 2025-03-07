/**
 * Game logic and state management
 */
class GameLogic {
    constructor() {
        // Game state
        this.gameState = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.gameId = null;
        this.playerSymbol = null;
        
        // Winning combinations
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]              // Diagonals
        ];
    }
    
    /**
     * Generate a random game ID
     * @returns {string} A random 6-character ID
     */
    generateGameId() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }
    
    /**
     * Reset the game state
     */
    resetGame() {
        this.gameState = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
    }
    
    /**
     * Make a move at the specified position
     * @param {number} index - The board position (0-8)
     * @returns {Object} Object containing move result information
     */
    makeMove(index) {
        // Check if the move is valid
        if (this.gameState[index] !== '' || !this.gameActive || this.currentPlayer !== this.playerSymbol) {
            return { valid: false };
        }
        
        // Update the game state
        this.gameState[index] = this.currentPlayer;
        
        // Check for win or draw
        const winner = this.checkWinner();
        const isDraw = !this.gameState.includes('') && !winner;
        
        if (winner || isDraw) {
            this.gameActive = false;
        } else {
            // Switch player
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
        
        return {
            valid: true,
            winner: winner,
            isDraw: isDraw,
            gameState: [...this.gameState],
            currentPlayer: this.currentPlayer,
            gameActive: this.gameActive
        };
    }
    
    /**
     * Check if there's a winner
     * @returns {string|null} The winner symbol or null
     */
    checkWinner() {
        for (let i = 0; i < this.winningConditions.length; i++) {
            const [a, b, c] = this.winningConditions[i];
            if (this.gameState[a] && this.gameState[a] === this.gameState[b] && this.gameState[a] === this.gameState[c]) {
                return this.gameState[a];
            }
        }
        return null;
    }
    
    /**
     * Update the game state from external data
     * @param {Object} data - The game data
     */
    updateFromData(data) {
        if (data) {
            this.gameState = data.board;
            this.currentPlayer = data.currentPlayer;
            this.gameActive = data.gameActive;
        }
    }
}

// Create a global instance
const gameLogic = new GameLogic();
