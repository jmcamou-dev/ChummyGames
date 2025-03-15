/**
 * High Card Game logic and state management
 */
class HighCardGame {
    constructor() {
        // Card constants
        this.SUITS = ['♠', '♥', '♦', '♣'];
        this.VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.CARD_COLORS = {
            '♠': 'black',
            '♥': 'red',
            '♦': 'red',
            '♣': 'black'
        };
        
        // Game settings
        this.ROUND_TIMEOUT = 10000; // 10 seconds per round
        this.MAX_ROUNDS = 10;
        
        // Game state
        this.gameActive = false;
        this.gameId = null;
        this.playerNumber = null; // 1 or 2
        this.deck = [];
        this.player1Hand = [];
        this.player2Hand = [];
        this.currentRound = 0;
        this.player1Score = 0;
        this.player2Score = 0;
        this.player1Card = null;
        this.player2Card = null;
        this.roundActive = false;
        this.roundWinner = null;
        this.gameWinner = null;
        this.roundStartTime = null;
        this.dealerNumber = 1;
    }
    
    /**
     * Generate a random game ID
     * @returns {string} A random 6-character ID
     */
    generateGameId() {
        return Math.random().toString(36).substr(2, 3).toUpperCase();
    }
    
    /**
     * Initialize a new game
     */
    initializeGame() {
        this.gameActive = true;
        this.currentRound = 0;
        this.player1Score = 0;
        this.player2Score = 0;
        this.player1Card = null;
        this.player2Card = null;
        this.roundActive = false;
        this.roundWinner = null;
        this.gameWinner = null;
        this.dealerNumber = 1;
        
        // Create and shuffle deck
        this.createDeck();
        this.shuffleDeck();
        
        // Deal initial hands
        this.dealHands();
        
        return {
            gameActive: this.gameActive,
            currentRound: this.currentRound,
            player1Score: this.player1Score,
            player2Score: this.player2Score,
            player1Hand: this.player1Hand,
            player2Hand: this.player2Hand,
            dealerNumber: this.dealerNumber
        };
    }
    
    /**
     * Create a new deck of cards
     */
    createDeck() {
        this.deck = [];
        for (const suit of this.SUITS) {
            for (const value of this.VALUES) {
                this.deck.push({
                    suit,
                    value,
                    color: this.CARD_COLORS[suit],
                    id: `${value}_${suit}`,
                    // Numeric value for comparisons
                    numericValue: this.VALUES.indexOf(value)
                });
            }
        }
    }
    
    /**
     * Shuffle the deck
     */
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    /**
     * Deal cards to both players
     */
    dealHands() {
        const handSize = this.MAX_ROUNDS;
        this.player1Hand = this.deck.splice(0, handSize);
        this.player2Hand = this.deck.splice(0, handSize);
    }
    
    /**
     * Start a new round
     */
    startRound() {
        if (!this.gameActive || this.roundActive) {
            return { valid: false };
        }
        
        this.currentRound++;
        this.roundActive = true;
        this.player1Card = null;
        this.player2Card = null;
        this.roundWinner = null;
        this.roundStartTime = Date.now();
        
        return {
            valid: true,
            round: this.currentRound,
            dealerNumber: this.dealerNumber
        };
    }
    
    /**
     * Play a card from a player's hand
     * @param {number} playerNum - The player number (1 or 2)
     * @param {number} cardIndex - Index of the card in the player's hand
     * @returns {Object} Result of playing the card
     */
    playCard(playerNum, cardIndex) {
        if (!this.gameActive || !this.roundActive || this.playerNumber !== playerNum) {
            return { valid: false };
        }
        
        const hand = playerNum === 1 ? this.player1Hand : this.player2Hand;
        
        if (cardIndex < 0 || cardIndex >= hand.length) {
            return { valid: false };
        }
        
        // Get the card from the player's hand
        const card = hand[cardIndex];
        
        // Remove the card from the player's hand
        if (playerNum === 1) {
            this.player1Card = card;
            this.player1Hand.splice(cardIndex, 1);
        } else {
            this.player2Card = card;
            this.player2Hand.splice(cardIndex, 1);
        }
        
        const result = {
            valid: true,
            card: card,
            playerNum: playerNum
        };
        
        // Check if both players have played a card
        if (this.player1Card && this.player2Card) {
            result.roundComplete = true;
            result.player1Card = this.player1Card;
            result.player2Card = this.player2Card;
            
            // Determine the winner
            if (this.player1Card.numericValue > this.player2Card.numericValue) {
                this.player1Score++;
                this.roundWinner = 1;
                result.roundWinner = 1;
            } else if (this.player1Card.numericValue < this.player2Card.numericValue) {
                this.player2Score++;
                this.roundWinner = 2;
                result.roundWinner = 2;
            } else {
                // Tie
                this.roundWinner = 0;
                result.roundWinner = 0;
            }
            
            result.player1Score = this.player1Score;
            result.player2Score = this.player2Score;
            
            // End the round
            this.roundActive = false;
            
            // Change dealer for next round
            this.dealerNumber = this.dealerNumber === 1 ? 2 : 1;
            result.dealerNumber = this.dealerNumber;
            
            // Check if game is over
            if (this.currentRound >= this.MAX_ROUNDS) {
                this.gameActive = false;
                
                if (this.player1Score > this.player2Score) {
                    this.gameWinner = 1;
                } else if (this.player1Score < this.player2Score) {
                    this.gameWinner = 2;
                } else {
                    this.gameWinner = 0; // Tie
                }
                
                result.gameOver = true;
                result.gameWinner = this.gameWinner;
            }
        }
        
        return result;
    }
    
    /**
     * Update game state from external data
     * @param {Object} data - Game data
     */
    updateFromData(data) {
        if (data) {
            this.gameActive = data.gameActive !== undefined ? data.gameActive : this.gameActive;
            this.currentRound = data.currentRound !== undefined ? data.currentRound : this.currentRound;
            this.roundActive = data.roundActive !== undefined ? data.roundActive : this.roundActive;
            this.player1Card = data.player1Card !== undefined ? data.player1Card : this.player1Card;
            this.player2Card = data.player2Card !== undefined ? data.player2Card : this.player2Card;
            this.roundWinner = data.roundWinner !== undefined ? data.roundWinner : this.roundWinner;
            this.gameWinner = data.gameWinner !== undefined ? data.gameWinner : this.gameWinner;
            this.dealerNumber = data.dealerNumber !== undefined ? data.dealerNumber : this.dealerNumber;
            
            if (this.playerNumber === 1) {
                this.player1Score = data.player1Score || 0;
                this.player2Score = data.player2Score || 0;
                this.player1Hand = data.player1Hand || [];
                this.player2Hand = []; // Don't know opponent's hand
            } else {
                this.player1Score = data.player2Score || 0;
                this.player2Score = data.player1Score || 0;
                this.player1Hand = data.player2Hand || [];
                this.player2Hand = []; // Don't know opponent's hand
            }
            
            // Ensure the correct number of unknown cards for opponent
            const opponentHandCount = this.playerNumber === 1 ? 
                (data.player2HandCount || 0) : (data.player1HandCount || 0);
            
            this.player2Hand = Array(opponentHandCount).fill({ 
                hidden: true,
                id: `hidden_${Math.random()}`
            });
        }
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        // No resources to clean up for now
    }
}

// Create a global instance
const highCardGame = new HighCardGame();