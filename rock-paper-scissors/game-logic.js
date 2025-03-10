/**
 * Rock-Paper-Scissors Game logic and state management
 */
class RockPaperScissorsGame {
    constructor() {
        // Game choices
        this.CHOICES = {
            ROCK: 'rock',
            PAPER: 'paper',
            SCISSORS: 'scissors'
        };
        
        // Game state
        this.gameActive = false;
        this.gameId = null;
        this.playerNumber = null; // 1 or 2
        this.playerChoice = null;
        this.opponentChoice = null;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.roundResult = null;
        this.waitingForOpponent = false;
    }
    
    /**
     * Generate a random game ID
     * @returns {string} A random 6-character ID
     */
    generateGameId() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }
    
    /**
     * Reset the game state for a new round
     */
    resetRound() {
        this.playerChoice = null;
        this.opponentChoice = null;
        this.roundResult = null;
        this.waitingForOpponent = false;
    }
    
    /**
     * Reset the entire game
     */
    resetGame() {
        this.resetRound();
        this.playerScore = 0;
        this.opponentScore = 0;
        this.gameActive = true;
    }
    
    /**
     * Make a choice (rock, paper, or scissors)
     * @param {string} choice - The player's choice
     * @returns {Object} Object containing choice result
     */
    makeChoice(choice) {
        if (!this.gameActive || this.waitingForOpponent) {
            return { valid: false };
        }
        
        this.playerChoice = choice;
        this.waitingForOpponent = true;
        
        return {
            valid: true,
            choice: choice,
            waitingForOpponent: true
        };
    }
    
    /**
     * Determine the winner of a round
     * @param {string} choice1 - First player's choice
     * @param {string} choice2 - Second player's choice
     * @returns {number} 0 for tie, 1 if choice1 wins, 2 if choice2 wins
     */
    determineWinner(choice1, choice2) {
        if (choice1 === choice2) {
            return 0; // Tie
        }
        
        if (
            (choice1 === this.CHOICES.ROCK && choice2 === this.CHOICES.SCISSORS) ||
            (choice1 === this.CHOICES.PAPER && choice2 === this.CHOICES.ROCK) ||
            (choice1 === this.CHOICES.SCISSORS && choice2 === this.CHOICES.PAPER)
        ) {
            return 1; // Choice 1 wins
        }
        
        return 2; // Choice 2 wins
    }
    
    /**
     * Process the round result
     * @param {string} opponentChoice - The opponent's choice
     * @returns {Object} The round result
     */
    processRoundResult(opponentChoice) {
        this.opponentChoice = opponentChoice;
        this.waitingForOpponent = false;
        
        let result;
        if (this.playerNumber === 1) {
            result = this.determineWinner(this.playerChoice, opponentChoice);
        } else {
            result = this.determineWinner(opponentChoice, this.playerChoice);
        }
        
        // 0 = tie, 1 = player 1 wins, 2 = player 2 wins
        if (result === 0) {
            this.roundResult = 'tie';
        } else if (
            (this.playerNumber === 1 && result === 1) ||
            (this.playerNumber === 2 && result === 2)
        ) {
            this.roundResult = 'win';
            this.playerScore++;
        } else {
            this.roundResult = 'lose';
            this.opponentScore++;
        }
        
        return {
            playerChoice: this.playerChoice,
            opponentChoice: this.opponentChoice,
            result: this.roundResult,
            playerScore: this.playerScore,
            opponentScore: this.opponentScore
        };
    }
    
    /**
     * Update the game state from external data
     * @param {Object} data - The game data
     */
    updateFromData(data) {
        if (!data) return;
        
        if (this.playerNumber === 1) {
            this.playerScore = data.player1Score || 0;
            this.opponentScore = data.player2Score || 0;
            this.opponentChoice = data.player2Choice;
        } else {
            this.playerScore = data.player2Score || 0;
            this.opponentScore = data.player1Score || 0;
            this.opponentChoice = data.player1Choice;
        }
        
        // Check if both players have made choices
        if (data.player1Choice && data.player2Choice) {
            this.processRoundResult(this.opponentChoice);
        }
    }
}

// Create a global instance
const rpsGame = new RockPaperScissorsGame();