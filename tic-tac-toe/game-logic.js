/**
 * Tic-Tac-Toe Game logic and state management
 */
class TicTacToeGame {
    constructor() {
        // Game state
        this.gameState = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.gameId = null;
        this.playerSymbol = null;
        
        // Score tracking
        this.playerScore = 0;
        this.opponentScore = 0;
        this.ties = 0;
        
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
        return Math.random().toString(36).substr(2, 3).toUpperCase();
    }
    
    /**
     * Reset the game state for a new round
     */
    resetRound() {
        this.gameState = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
    }
    
    /**
     * Reset the entire game
     */
    resetGame() {
        this.resetRound();
        this.playerScore = 0;
        this.opponentScore = 0;
        this.ties = 0;
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
        
        // Update scores
        if (winner) {
            if (winner === this.playerSymbol) {
                this.playerScore++;
            } else {
                this.opponentScore++;
            }
            this.gameActive = false;
        } else if (isDraw) {
            this.ties++;
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
            gameActive: this.gameActive,
            playerScore: this.playerScore,
            opponentScore: this.opponentScore,
            ties: this.ties
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
            
            if (this.playerSymbol === 'X') {
                this.playerScore = data.playerXScore || 0;
                this.opponentScore = data.playerOScore || 0;
            } else {
                this.playerScore = data.playerOScore || 0;
                this.opponentScore = data.playerXScore || 0;
            }
            
            this.ties = data.ties || 0;
        }
    }
}

// Create a global instance
const ticTacToeGame = new TicTacToeGame();
