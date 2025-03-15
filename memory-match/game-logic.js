/**
 * Memory Match Game logic and state management
 */
class MemoryMatchGame {
    constructor() {
        // Game constants
        this.CARD_STATES = {
            HIDDEN: 'hidden',
            REVEALED: 'revealed',
            MATCHED: 'matched'
        };
        
        // Difficulty levels
        this.DIFFICULTY = {
            EASY: { pairs: 6, timeLimit: 60 },
            MEDIUM: { pairs: 8, timeLimit: 90 },
            HARD: { pairs: 12, timeLimit: 120 }
        };
        
        // Card symbols (emoji pairs)
        this.CARD_SYMBOLS = [
            '🍎', '🍌', '🍒', '🍓', '🍊', '🍇', '🍉', '🍋', '🍍', '🥝', '🥥', '🍅',
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐮', '🐷'
        ];
        
        // Game state
        this.gameActive = false;
        this.gameId = null;
        this.playerNumber = null; // 1 or 2
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.currentPlayer = null; // 1 or 2
        this.difficulty = this.DIFFICULTY.EASY;
        this.timerActive = false;
        this.timeRemaining = 0;
        this.timerInterval = null;
    }
    
    /**
     * Generate a random game ID
     * @returns {string} A random 6-character ID
     */
    generateGameId() {
        return Math.random().toString(36).substr(2, 3).toUpperCase();
    }
    
    /**
     * Initialize the game with the specified difficulty
     * @param {string} difficultyLevel - 'EASY', 'MEDIUM', or 'HARD'
     */
    initializeGame(difficultyLevel = 'EASY') {
        this.difficulty = this.DIFFICULTY[difficultyLevel];
        this.gameActive = true;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.timeRemaining = this.difficulty.timeLimit;
        
        // Create shuffled card pairs
        this.createCards();
        
        // Determine starting player
        this.currentPlayer = 1;
        
        return {
            cards: this.cards,
            currentPlayer: this.currentPlayer,
            timeRemaining: this.timeRemaining
        };
    }
    
    /**
     * Create card deck with pairs of symbols
     */
    createCards() {
        // Select symbols based on difficulty
        const symbols = [...this.CARD_SYMBOLS].slice(0, this.difficulty.pairs);
        
        // Create pairs
        const cardPairs = [];
        symbols.forEach(symbol => {
            cardPairs.push({ id: this.generateCardId(), symbol, state: this.CARD_STATES.HIDDEN });
            cardPairs.push({ id: this.generateCardId(), symbol, state: this.CARD_STATES.HIDDEN });
        });
        
        // Shuffle cards
        this.cards = this.shuffleArray(cardPairs);
    }
    
    /**
     * Generate a unique card ID
     * @returns {string} A unique ID for a card
     */
    generateCardId() {
        return `card_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Shuffle an array using Fisher-Yates algorithm
     * @param {Array} array - The array to shuffle
     * @returns {Array} The shuffled array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    /**
     * Flip a card
     * @param {string} cardId - The ID of the card to flip
     * @returns {Object} Result of the flip
     */
    flipCard(cardId) {
        // Check if game is active and it's the player's turn
        if (!this.gameActive || this.playerNumber !== this.currentPlayer || this.flippedCards.length >= 2) {
            console.log("flipCard_1"+(!this.gameActive ).toString()+(this.playerNumber !== this.currentPlayer).toString()+(this.flippedCards.length >= 2).toString())
            return { valid: false };
        }
        
        // Find the card
        const cardIndex = this.cards.findIndex(card => card.id === cardId);
        if (cardIndex === -1) {
            console.log("flipCard_2")
            return { valid: false };
        }
        
        const card = this.cards[cardIndex];
        
        // Check if card is already revealed or matched
        if (card.state !== this.CARD_STATES.HIDDEN) {
            console.log("flipCard_3")
            return { valid: false };
        }
        
        // Flip the card
        card.state = this.CARD_STATES.REVEALED;
        this.flippedCards.push(card);
        
        let result = {
            valid: true,
            cardId: card.id,
            symbol: card.symbol,
            flippedCards: this.flippedCards.length,
            matchFound: false,
            turnComplete: false,
            nextPlayer: this.currentPlayer
        };
        
        console.log("flipCard_4")
        // Check if two cards are flipped
        if (this.flippedCards.length === 2) {
            console.log("flipCard_5")
            // Check for a match
            if (this.flippedCards[0].symbol === this.flippedCards[1].symbol) {
                console.log("flipCard_6")
                // Match found
                this.flippedCards.forEach(flippedCard => {
                    const matchedCard = this.cards.find(c => c.id === flippedCard.id);
                    if (matchedCard) {
                        matchedCard.state = this.CARD_STATES.MATCHED;
                    }
                });
                
                this.matchedPairs++;
                
                // Increment player score
                if (this.playerNumber === 1) {
                    this.playerScore++;
                } else {
                    this.opponentScore++;
                }
                
                result.matchFound = true;
                
                // Clear flipped cards
                this.flippedCards = [];
            } else {
                console.log("flipCard_7")
                // No match, end turn after delay
                result.turnComplete = true;
                result.nextPlayer = this.currentPlayer === 1 ? 2 : 1;
            }
        }
        
        // Check if game is complete
        if (this.matchedPairs === this.difficulty.pairs) {
            console.log("flipCard_9")
            this.gameActive = false;
            result.gameComplete = true;
            result.playerScore = this.playerScore;
            result.opponentScore = this.opponentScore;
            
            // Determine winner
            if (this.playerNumber === 1) {
                result.winner = this.playerScore > this.opponentScore ? 1 : 
                                this.playerScore < this.opponentScore ? 2 : 0; // 0 for tie
                                console.log("flipCard_10")
            } else {
                result.winner = this.opponentScore > this.playerScore ? 1 : 
                                this.opponentScore < this.playerScore ? 2 : 0;
                                console.log("flipCard_11")
            }
        }
        console.log("flipCard_12")
        
        return result;
    }
    
    /**
     * End the current turn and flip unmatched cards back
     */
    endTurn() {
        // Flip unmatched cards back
        this.flippedCards.forEach(flippedCard => {
            const card = this.cards.find(c => c.id === flippedCard.id);
            if (card) {
                card.state = this.CARD_STATES.HIDDEN;
            }
        });
        
        // Clear flipped cards
        this.flippedCards = [];
        
        // Switch current player
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        
        return {
            currentPlayer: this.currentPlayer,
            cards: this.cards
        };
    }
    
    /**
     * Start the game timer
     * @param {Function} tickCallback - Callback function called every second
     * @param {Function} timeoutCallback - Callback function called when time runs out
     */
    startTimer(tickCallback, timeoutCallback) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerActive = true;
        
        this.timerInterval = setInterval(() => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                if (tickCallback) {
                    tickCallback(this.timeRemaining);
                }
            } else {
                this.stopTimer();
                if (timeoutCallback) {
                    timeoutCallback();
                }
            }
        }, 1000);
    }
    
    /**
     * Stop the game timer
     */
    stopTimer() {
        this.timerActive = false;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    /**
     * Update the game state from external data
     * @param {Object} data - The game data
     */
    updateFromData(data) {
        if (data) {
            this.cards = data.cards || this.cards;
            this.currentPlayer = data.currentPlayer || this.currentPlayer;
            this.gameActive = data.gameActive !== undefined ? data.gameActive : this.gameActive;
            this.matchedPairs = data.matchedPairs || this.matchedPairs;
            this.timeRemaining = data.timeRemaining !== undefined ? data.timeRemaining : this.timeRemaining;
            
            if (this.playerNumber === 1) {
                this.playerScore = data.player1Score || 0;
                this.opponentScore = data.player2Score || 0;
            } else {
                this.playerScore = data.player2Score || 0;
                this.opponentScore = data.player1Score || 0;
            }
        }
    }
    
    /**
     * Clean up resources when the game ends
     */
    cleanup() {
        this.stopTimer();
    }
}

// Create a global instance
const memoryMatchGame = new MemoryMatchGame();